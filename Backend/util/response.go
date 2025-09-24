package util

// ApiResponse API响应格式
type ApiResponse struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

// StatusCode 状态码定义
const (
	StatusCodeSuccess           = 200
	StatusCodeBadRequest        = 400
	StatusCodeUnauthorized      = 401
	StatusCodeForbidden         = 403
	StatusCodeNotFound          = 404
	StatusCodeInternalError     = 500
	StatusCodeUserExist         = 1001
	StatusCodeUserPasswordError = 1002
	StatusCodeUserInfoError     = 1003
	StatusCodeUserAvatarError   = 1004
	StatusCodeUserPasswordChangeError = 1005
	StatusCodeUserDataExportError = 1006
	StatusCodeUserDataDeleteError = 1007
	StatusCodePrivacySettingsError = 1008
	StatusCodePerformanceNotExist    = 2001
	StatusCodePerformanceNotOnSale   = 2002
	StatusCodeTicketNotExist    = 3001
	StatusCodeTicketStockInsufficient = 3002
	StatusCodeTicketSeckillFailed     = 3003
	StatusCodeTicketLimitExceeded     = 3004
	StatusCodeOrderNotExist     = 4001
	StatusCodeOrderExpired      = 4002
	StatusCodeOrderStatusError  = 4003
	StatusCodeOrderDuplicate    = 4004
	StatusCodePaymentError      = 4005
)

// StatusMessage 状态码对应的消息
var StatusMessage = map[int]string{
	StatusCodeSuccess:           "success",
	StatusCodeBadRequest:        "请求参数错误",
	StatusCodeUnauthorized:      "未认证(未登录或token过期)",
	StatusCodeForbidden:         "权限不足",
	StatusCodeNotFound:          "资源不存在",
	StatusCodeInternalError:     "服务器内部错误",
	StatusCodeUserExist:         "用户已存在",
	StatusCodeUserPasswordError: "用户名或密码错误",
	StatusCodeUserInfoError:     "用户信息格式错误",
	StatusCodeUserAvatarError:   "头像上传失败",
	StatusCodeUserPasswordChangeError: "密码修改失败",
	StatusCodeUserDataExportError: "数据导出失败",
	StatusCodeUserDataDeleteError: "数据删除失败",
	StatusCodePrivacySettingsError: "隐私设置错误",
	StatusCodePerformanceNotExist:    "演出不存在",
	StatusCodePerformanceNotOnSale:   "演出未开售",
	StatusCodeTicketNotExist:    "票种不存在",
	StatusCodeTicketStockInsufficient: "库存不足",
	StatusCodeTicketSeckillFailed:     "抢票失败，请重试",
	StatusCodeTicketLimitExceeded:     "每人限购5张票",
	StatusCodeOrderNotExist:     "订单不存在",
	StatusCodeOrderExpired:      "订单已过期",
	StatusCodeOrderStatusError:  "订单状态错误",
	StatusCodeOrderDuplicate:    "不能重复创建订单",
	StatusCodePaymentError:      "支付失败",
}

// SuccessResponse 创建成功响应
func SuccessResponse(data interface{}) ApiResponse {
	return ApiResponse{
		Code:    StatusCodeSuccess,
		Message: StatusMessage[StatusCodeSuccess],
		Data:    data,
	}
}

// ErrorResponse 创建错误响应
func ErrorResponse(code int, message string) ApiResponse {
	if message == "" {
		message = StatusMessage[code]
	}
	return ApiResponse{
		Code:    code,
		Message: message,
		Data:    nil,
	}
}