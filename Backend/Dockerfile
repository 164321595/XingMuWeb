# 构建阶段
FROM golang:1.23-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git

COPY go.mod go.sum* ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o ticket-server .

# 运行阶段
FROM alpine:3.19

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata && \
    addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/ticket-server .
COPY --from=builder /app/config ./config

EXPOSE 8080

ENV GIN_MODE=release
ENV TZ=Asia/Shanghai

USER appuser

ENTRYPOINT ["./ticket-server"]
