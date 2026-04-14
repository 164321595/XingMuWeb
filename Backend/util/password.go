package util

import (
	"regexp"
	"unicode"

	"golang.org/x/crypto/bcrypt"
)

const bcryptCost = 12

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcryptCost)
	return string(bytes), err
}

func CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func ValidatePasswordStrength(password string) (bool, string) {
	if len(password) < 8 {
		return false, "密码长度至少8位"
	}

	var (
		hasUpper   bool
		hasLower   bool
		hasDigit   bool
		hasSpecial bool
	)

	for _, char := range password {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsDigit(char):
			hasDigit = true
		case unicode.IsPunct(char) || unicode.IsSymbol(char):
			hasSpecial = true
		}
	}

	if !hasUpper {
		return false, "密码必须包含大写字母"
	}
	if !hasLower {
		return false, "密码必须包含小写字母"
	}
	if !hasDigit {
		return false, "密码必须包含数字"
	}
	if !hasSpecial {
		return false, "密码必须包含特殊字符"
	}

	commonPasswords := []string{"123456", "password", "qwerty", "admin123", "111111", "12345678", "abc123", "password1"}
	lowerPassword := toLower(password)
	for _, common := range commonPasswords {
		if lowerPassword == common || contains(lowerPassword, common) {
			return false, "密码太简单，请使用更复杂的密码"
		}
	}

	return true, ""
}

func toLower(s string) string {
	result := make([]byte, len(s))
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c >= 'A' && c <= 'Z' {
			c += 'a' - 'A'
		}
		result[i] = c
	}
	return string(result)
}

func contains(s, substr string) bool {
	if len(substr) == 0 {
		return true
	}
	if len(s) < len(substr) {
		return false
	}
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}

func ValidateFileType(contentType string, allowedTypes []string) bool {
	for _, t := range allowedTypes {
		if t == contentType {
			return true
		}
	}
	return false
}

func IsImageType(contentType string) bool {
	imageTypes := []string{"image/jpeg", "image/png", "image/gif", "image/webp"}
	return ValidateFileType(contentType, imageTypes)
}

var fileTypePattern = regexp.MustCompile(`^[a-zA-Z0-9/_.-]+$`)

func ValidateFileExtension(filename string) bool {
	allowedExtensions := []string{".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".doc", ".docx", ".xls", ".xlsx"}

	lowerName := toLower(filename)
	for _, ext := range allowedExtensions {
		if len(lowerName) >= len(ext) && lowerName[len(lowerName)-len(ext):] == ext {
			return true
		}
	}
	return false
}
