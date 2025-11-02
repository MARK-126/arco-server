CREATE TABLE IF NOT EXISTS tour_packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  activity_type ENUM('trekking', 'mountain-bike', 'naturaleza', 'fogon') NOT NULL,
  difficulty ENUM('bajo', 'medio', 'alto') DEFAULT 'medio',
  duration_hours INT,
  max_participants INT DEFAULT 10,
  price DECIMAL(10, 2) NOT NULL,
  location VARCHAR(255),
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_activity_type (activity_type),
  INDEX idx_is_active (is_active)
);

INSERT INTO tour_packages (name, description, activity_type, difficulty, duration_hours, max_participants, price, location, image_url) VALUES
('Trekking Cerro Arco', 'Ascenso al Cerro Arco con vistas panorámicas de la cordillera', 'trekking', 'medio', 6, 15, 15000.00, 'Cerro Arco, Las Heras, Mendoza', '/images/trekking.png'),
('Mountain Bike Aventura', 'Recorrido en bicicleta por senderos de montaña', 'mountain-bike', 'alto', 4, 10, 12000.00, 'Cerro Arco, Las Heras, Mendoza', '/images/mountain-bike.png'),
('Naturaleza y Observación', 'Caminata suave para observar flora y fauna local', 'naturaleza', 'bajo', 3, 20, 8000.00, 'Cerro Arco, Las Heras, Mendoza', '/images/zorros.png'),
('Fogón Nocturno', 'Experiencia de fogon con gastronomía regional', 'fogon', 'bajo', 2, 25, 10000.00, 'Posta de los Río, Las Heras, Mendoza', '/images/fogon.png');

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  phone VARCHAR(20),
  status ENUM('pending', 'read', 'replied') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
