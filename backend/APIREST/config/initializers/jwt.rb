# JWT Configuration for shared secret validation with Auth microservice
# Both Auth and APIREST must use the same secret and issuer

# Load from environment variables or .env file
require 'dotenv/load' if defined?(Dotenv)

JWT_SECRET_KEY = ENV.fetch('JWT_SECRET') do
  raise "JWT_SECRET environment variable is not set! Add it to .env file"
end.freeze

JWT_ISSUER = ENV.fetch('JWT_ISSUER', 'auth-service').freeze
JWT_ALGORITHM = "HS256".freeze

Rails.logger.info "🔐 [JWT] Initialized with issuer: #{JWT_ISSUER}"