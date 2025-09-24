package model

import (
	"time"

	"ticket-system-backend/util"
)

// UserPrivacySetting 用户隐私设置模型
type UserPrivacySetting struct {
	ID              int       `gorm:"primary_key;auto_increment" json:"id"`
	UserID          int       `gorm:"not null;unique_index" json:"user_id"`
	DataCollection  int8      `gorm:"default:1" json:"data_collection"` // 1:允许,0:禁止
	PersonalizedAds int8      `gorm:"default:1" json:"personalized_ads"` // 1:允许,0:禁止
	ThirdPartySharing int8    `gorm:"default:0" json:"third_party_sharing"` // 1:允许,0:禁止
	MarketingEmails int8      `gorm:"default:1" json:"marketing_emails"` // 1:允许,0:禁止
	UpdatedAt       time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// CreateUserPrivacySetting 创建用户隐私设置
func CreateUserPrivacySetting(setting *UserPrivacySetting) error {
	return util.DB.Create(setting).Error
}

// GetUserPrivacySettingByUserID 根据用户ID获取隐私设置
func GetUserPrivacySettingByUserID(userID int) (*UserPrivacySetting, error) {
	var setting UserPrivacySetting
	err := util.DB.Where("user_id = ?", userID).First(&setting).Error
	if err != nil {
		return nil, err
	}
	return &setting, nil
}

// UpdateUserPrivacySetting 更新用户隐私设置
func UpdateUserPrivacySetting(setting *UserPrivacySetting) error {
	return util.DB.Model(setting).Updates(setting).Error
}