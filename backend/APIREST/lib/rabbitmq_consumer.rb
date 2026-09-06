require 'bunny'
require 'json'

class RabbitMQConsumer
  def self.start
    connection = Bunny.new(ENV['RABBITMQ_URL'] || 'amqp://localhost:5672')
    connection.start

    channel = connection.create_channel
    queue = channel.queue('auth_queue', durable: true)

    puts " [*] Waiting for messages in #{queue.name}. To exit press CTRL+C"

    queue.subscribe(manual_ack: true) do |delivery_info, _properties, body|
      begin
        payload = JSON.parse(body)
        puts " [✅] Received #{payload}"

        process_message(payload)

        channel.ack(delivery_info.delivery_tag)
      rescue StandardError => e
        puts " [❌] Error processing message: #{e.message}"
        # In a real scenario, you might want to reject and requeue or move to a DLQ
        channel.nack(delivery_info.delivery_tag, false, true)
      end
    end

    # Keep the process alive
    loop do
      sleep 1
    end
  end

  def self.process_message(payload)
    data = payload['data'] || payload
    user_id = data['id']
    rol = data['rol']

    puts " [🔄] Processing profile for user #{user_id} with role #{rol}"

    # Idempotency: Create profile based on rol
    case rol
    when 'cliente'
      unless Cliente.exists?(usuario_id: user_id)
        attrs = data['cliente_attributes'] || {}
        Cliente.create!(
          usuario_id: user_id, 
          cedula: attrs['cedula'] || "PENDIENTE_#{user_id}"
        )
        puts " [✅] Created Cliente profile for #{user_id}"
      end
    when 'arquitecto'
      unless Arquitecto.exists?(usuario_id: user_id)
        attrs = data['arquitecto_attributes'] || {}
        Arquitecto.create!(
          usuario_id: user_id, 
          cedula: attrs['cedula'] || "PENDIENTE_#{user_id}",
          descripcion: attrs['descripcion'] || "Perfil creado automáticamente",
          especialidades: attrs['especialidades'] || "Pendiente",
          ubicacion: attrs['ubicacion'] || "Pendiente",
          valoracion_prom_proyecto: attrs['valoracion_prom_proyecto'] || 0.0,
          verificado: attrs['verificado'] || false,
          vistas_perfil: attrs['vistas_perfil'] || 0
        )
        puts " [✅] Created Arquitecto profile for #{user_id}"
      end
    when 'moderador'
      unless Moderador.exists?(usuario_id: user_id)
        attrs = data['moderador_attributes'] || {}
        Moderador.create!(
          usuario_id: user_id,
          num_incidencias_resueltas: attrs['num_incidencias_resueltas'] || 0,
          num_arquitectos_verificados: attrs['num_arquitectos_verificados'] || 0
        )
        puts " [✅] Created Moderador profile for #{user_id}"
      end
    end
  end
end
