namespace :rabbitmq do
  desc "Start RabbitMQ consumer for auth events"
  task consume: :environment do
    require_relative '../rabbitmq_consumer'
    RabbitMQConsumer.start
  end
end
