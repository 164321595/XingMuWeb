package util

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
)

var (
	ErrLockAcquireFailed = errors.New("获取分布式锁失败")
	ErrLockReleaseFailed = errors.New("释放分布式锁失败")
)

type DistributedLock struct {
	client     *redis.Client
	key        string
	value      string
	expiration time.Duration
}

func NewDistributedLock(key string, expiration time.Duration) *DistributedLock {
	return &DistributedLock{
		client:     RedisClient,
		key:        key,
		value:      fmt.Sprintf("%d", time.Now().UnixNano()),
		expiration: expiration,
	}
}

func (lock *DistributedLock) Acquire(ctx context.Context) (bool, error) {
	result, err := lock.client.SetNX(ctx, lock.key, lock.value, lock.expiration).Result()
	if err != nil {
		return false, fmt.Errorf("设置Redis键值对失败: %w", err)
	}
	return result, nil
}

func (lock *DistributedLock) Release(ctx context.Context) error {
	script := `
		if redis.call("get", KEYS[1]) == ARGV[1] then
			return redis.call("del", KEYS[1])
		else
			return 0
		end
	`

	result, err := lock.client.Eval(ctx, script, []string{lock.key}, lock.value).Int64()
	if err != nil {
		return fmt.Errorf("释放分布式锁失败: %w", err)
	}

	if result == 0 {
		return ErrLockReleaseFailed
	}

	return nil
}

func AcquireSeckillLock(ctx context.Context, ticketTypeID int, timeout time.Duration) (*DistributedLock, error) {
	lock := NewDistributedLock(
		fmt.Sprintf("seckill:lock:ticket:%d", ticketTypeID),
		timeout,
	)

	acquired, err := lock.Acquire(ctx)
	if err != nil {
		return nil, err
	}

	if !acquired {
		return nil, ErrLockAcquireFailed
	}

	return lock, nil
}

func ReleaseSeckillLock(lock *DistributedLock, ctx context.Context) error {
	if lock == nil {
		return nil
	}
	return lock.Release(ctx)
}
