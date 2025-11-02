const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

db.getConnection()
  .then((connection) => {
    console.log("Conexión a la base de datos exitosa");
    connection.release();
  })
  .catch((err) => {
    console.error("Error al conectar a la base de datos:", err.message);
    console.error("Verifica que el contenedor MySQL esté corriendo: docker ps");
  });

app.post("/api/packages", async (req, res) => {
  try {
    const {
      name,
      description,
      activity_type,
      difficulty,
      duration_hours,
      max_participants,
      price,
      location,
      image_url,
    } = req.body;

    if (!name || !description || !activity_type || !price) {
      return res.status(400).json({
        success: false,
        message:
          "Los campos name, description, activity_type y price son obligatorios",
      });
    }

    const [result] = await db.query(
      `INSERT INTO tour_packages
       (name, description, activity_type, difficulty, duration_hours, max_participants, price, location, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        activity_type,
        difficulty || "medio",
        duration_hours,
        max_participants || 10,
        price,
        location,
        image_url,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Paquete creado exitosamente",
      data: {
        id: result.insertId,
        name,
        description,
        activity_type,
        difficulty: difficulty || "medio",
        duration_hours,
        max_participants: max_participants || 10,
        price,
        location,
        image_url,
      },
    });
  } catch (error) {
    console.error("Error al crear paquete:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear el paquete",
      error: error.message,
    });
  }
});

app.get("/api/packages", async (req, res) => {
  try {
    const { activity_type, difficulty, is_active } = req.query;

    let query = "SELECT * FROM tour_packages WHERE 1=1";
    const params = [];

    if (activity_type) {
      query += " AND activity_type = ?";
      params.push(activity_type);
    }

    if (difficulty) {
      query += " AND difficulty = ?";
      params.push(difficulty);
    }

    if (is_active !== undefined) {
      query += " AND is_active = ?";
      params.push(is_active === "true" ? 1 : 0);
    }

    query += " ORDER BY created_at DESC";

    const [packages] = await db.query(query, params);

    res.json({
      success: true,
      data: packages,
      total: packages.length,
    });
  } catch (error) {
    console.error("Error al obtener paquetes:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los paquetes",
      error: error.message,
    });
  }
});

app.get("/api/packages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [packages] = await db.query(
      "SELECT * FROM tour_packages WHERE id = ?",
      [id],
    );

    if (packages.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Paquete no encontrado",
      });
    }

    res.json({
      success: true,
      data: packages[0],
    });
  } catch (error) {
    console.error("Error al obtener paquete:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el paquete",
      error: error.message,
    });
  }
});

app.put("/api/packages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      activity_type,
      difficulty,
      duration_hours,
      max_participants,
      price,
      location,
      image_url,
      is_active,
    } = req.body;

    const [existing] = await db.query(
      "SELECT * FROM tour_packages WHERE id = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Paquete no encontrado",
      });
    }

    await db.query(
      `UPDATE tour_packages
       SET name = ?, description = ?, activity_type = ?, difficulty = ?,
           duration_hours = ?, max_participants = ?, price = ?, location = ?,
           image_url = ?, is_active = ?
       WHERE id = ?`,
      [
        name || existing[0].name,
        description || existing[0].description,
        activity_type || existing[0].activity_type,
        difficulty || existing[0].difficulty,
        duration_hours !== undefined
          ? duration_hours
          : existing[0].duration_hours,
        max_participants !== undefined
          ? max_participants
          : existing[0].max_participants,
        price !== undefined ? price : existing[0].price,
        location || existing[0].location,
        image_url || existing[0].image_url,
        is_active !== undefined ? is_active : existing[0].is_active,
        id,
      ],
    );

    const [updated] = await db.query(
      "SELECT * FROM tour_packages WHERE id = ?",
      [id],
    );

    res.json({
      success: true,
      message: "Paquete actualizado exitosamente",
      data: updated[0],
    });
  } catch (error) {
    console.error("Error al actualizar paquete:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el paquete",
      error: error.message,
    });
  }
});

app.delete("/api/packages/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query(
      "SELECT * FROM tour_packages WHERE id = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Paquete no encontrado",
      });
    }

    await db.query("DELETE FROM tour_packages WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Paquete eliminado exitosamente",
      data: existing[0],
    });
  } catch (error) {
    console.error("Error al eliminar paquete:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el paquete",
      error: error.message,
    });
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message, phone } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Los campos nombre, email y mensaje son obligatorios",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "El formato del email no es válido",
      });
    }

    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        message: "El mensaje debe tener al menos 10 caracteres",
      });
    }

    const [result] = await db.query(
      "INSERT INTO contact_messages (name, email, message, phone) VALUES (?, ?, ?, ?)",
      [name, email, message, phone || null],
    );

    res.status(201).json({
      success: true,
      message:
        "Mensaje enviado exitosamente. Nos pondremos en contacto pronto.",
      data: {
        id: result.insertId,
        name,
        email,
        message,
        phone,
      },
    });
  } catch (error) {
    console.error("Error al crear mensaje de contacto:", error);
    res.status(500).json({
      success: false,
      message: "Error al enviar el mensaje. Por favor intenta nuevamente.",
      error: error.message,
    });
  }
});

app.get("/api/contact", async (req, res) => {
  try {
    const { status } = req.query;

    let query = "SELECT * FROM contact_messages WHERE 1=1";
    const params = [];

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    query += " ORDER BY created_at DESC";

    const [messages] = await db.query(query, params);

    res.json({
      success: true,
      data: messages,
      total: messages.length,
    });
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los mensajes",
      error: error.message,
    });
  }
});

app.get("/api/contact/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [messages] = await db.query(
      "SELECT * FROM contact_messages WHERE id = ?",
      [id],
    );

    if (messages.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Mensaje no encontrado",
      });
    }

    res.json({
      success: true,
      data: messages[0],
    });
  } catch (error) {
    console.error("Error al obtener mensaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el mensaje",
      error: error.message,
    });
  }
});

app.put("/api/contact/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [existing] = await db.query(
      "SELECT * FROM contact_messages WHERE id = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Mensaje no encontrado",
      });
    }

    await db.query("UPDATE contact_messages SET status = ? WHERE id = ?", [
      status,
      id,
    ]);

    const [updated] = await db.query(
      "SELECT * FROM contact_messages WHERE id = ?",
      [id],
    );

    res.json({
      success: true,
      message: "Estado del mensaje actualizado exitosamente",
      data: updated[0],
    });
  } catch (error) {
    console.error("Error al actualizar mensaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el mensaje",
      error: error.message,
    });
  }
});

app.delete("/api/contact/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query(
      "SELECT * FROM contact_messages WHERE id = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Mensaje no encontrado",
      });
    }

    await db.query("DELETE FROM contact_messages WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Mensaje eliminado exitosamente",
      data: existing[0],
    });
  } catch (error) {
    console.error("Error al eliminar mensaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el mensaje",
      error: error.message,
    });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "API funcionando correctamente" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Endpoints disponibles:`);
  console.log(`\nPaquetes:`);
  console.log(`  GET    http://localhost:${PORT}/api/packages`);
  console.log(`  GET    http://localhost:${PORT}/api/packages/:id`);
  console.log(`  POST   http://localhost:${PORT}/api/packages`);
  console.log(`  PUT    http://localhost:${PORT}/api/packages/:id`);
  console.log(`  DELETE http://localhost:${PORT}/api/packages/:id`);
  console.log(`\nContacto:`);
  console.log(`  POST   http://localhost:${PORT}/api/contact`);
  console.log(`  GET    http://localhost:${PORT}/api/contact`);
  console.log(`  GET    http://localhost:${PORT}/api/contact/:id`);
  console.log(`  PUT    http://localhost:${PORT}/api/contact/:id`);
  console.log(`  DELETE http://localhost:${PORT}/api/contact/:id`);
});
