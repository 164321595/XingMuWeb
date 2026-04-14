package service

import (
	"errors"
	"time"

	"ticket-system-backend/model"
	"ticket-system-backend/util"
)

var (
	ErrUserNotFound      = errors.New("用户不存在")
	ErrUserAlreadyExists = errors.New("用户已存在")
	ErrInvalidPassword   = errors.New("密码错误")
)

type UserService struct{}

func NewUserService() *UserService {
	return &UserService{}
}

func (s *UserService) Register(username, password, phone, email string) (*model.User, error) {
	existingUser, _ := model.GetUserByUsername(username)
	if existingUser != nil {
		return nil, ErrUserAlreadyExists
	}

	hashedPassword, err := util.HashPassword(password)
	if err != nil {
		return nil, err
	}

	user := &model.User{
		Username:  username,
		Password:  hashedPassword,
		Phone:     phone,
		Email:     email,
		Avatar:    "/uploads/avatars/default.png",
		Status:    1,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := model.CreateUser(user); err != nil {
		return nil, err
	}

	setting := &model.UserPrivacySetting{
		UserID:            user.ID,
		DataCollection:    1,
		PersonalizedAds:   1,
		ThirdPartySharing: 0,
		MarketingEmails:   1,
	}

	if err := model.CreateUserPrivacySetting(setting); err != nil {
		return user, nil
	}

	return user, nil
}

func (s *UserService) Login(username, password string) (*model.User, string, error) {
	user, err := model.GetUserByUsername(username)
	if err != nil {
		return nil, "", ErrUserNotFound
	}

	if !util.CheckPassword(password, user.Password) {
		return nil, "", ErrInvalidPassword
	}

	token, err := util.GenerateToken(user.ID, user.Username)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func (s *UserService) GetUserByID(id int) (*model.User, error) {
	user, err := model.GetUserByID(id)
	if err != nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (s *UserService) UpdateUser(user *model.User) error {
	return model.UpdateUser(user)
}

func (s *UserService) ChangePassword(userID int, currentPassword, newPassword string) error {
	user, err := model.GetUserByID(userID)
	if err != nil {
		return ErrUserNotFound
	}

	if !util.CheckPassword(currentPassword, user.Password) {
		return ErrInvalidPassword
	}

	hashedPassword, err := util.HashPassword(newPassword)
	if err != nil {
		return err
	}

	user.Password = hashedPassword
	user.UpdatedAt = time.Now()

	return model.UpdateUser(user)
}

func (s *UserService) GetPrivacySettings(userID int) (*model.UserPrivacySetting, error) {
	return model.GetUserPrivacySettingByUserID(userID)
}

func (s *UserService) UpdatePrivacySettings(userID int, dataCollection, personalizedAds, thirdPartySharing, marketingEmails bool) error {
	setting, err := model.GetUserPrivacySettingByUserID(userID)
	if err != nil {
		setting = &model.UserPrivacySetting{
			UserID: userID,
		}
	}

	if dataCollection {
		setting.DataCollection = 1
	} else {
		setting.DataCollection = 0
	}
	if personalizedAds {
		setting.PersonalizedAds = 1
	} else {
		setting.PersonalizedAds = 0
	}
	if thirdPartySharing {
		setting.ThirdPartySharing = 1
	} else {
		setting.ThirdPartySharing = 0
	}
	if marketingEmails {
		setting.MarketingEmails = 1
	} else {
		setting.MarketingEmails = 0
	}
	setting.UpdatedAt = time.Now()

	if setting.ID == 0 {
		return model.CreateUserPrivacySetting(setting)
	}
	return model.UpdateUserPrivacySetting(setting)
}
