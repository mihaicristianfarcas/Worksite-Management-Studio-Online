# Build stage
FROM golang:1.24.1-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git

# Set working directory
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Final stage
FROM alpine:3.19

# Install runtime dependencies
RUN apk add --no-cache ca-certificates tzdata

# Set working directory
WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/main .

# Copy any necessary config files
COPY --from=builder /app/config ./config

# Create a non-root user
RUN adduser -D -g '' appuser
USER appuser

# Expose the application port
EXPOSE 8080

# Run the application
CMD ["./main"] 