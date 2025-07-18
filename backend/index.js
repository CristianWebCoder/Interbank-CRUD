const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a la base de datos SQLite
const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite');
    initDatabase();
  }
});

// Inicializar la base de datos
function initDatabase() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS transfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender TEXT NOT NULL,
      receiver TEXT NOT NULL,
      amount REAL NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.run(createTableSQL, (err) => {
    if (err) {
      console.error('Error creando la tabla:', err.message);
    } else {
      console.log('Tabla transfers creada o verificada exitosamente');
      
      // Insertar datos de ejemplo si la tabla está vacía
      db.get('SELECT COUNT(*) as count FROM transfers', (err, row) => {
        if (err) {
          console.error('Error verificando datos:', err.message);
        } else if (row.count === 0) {
          insertSampleData();
        }
      });
    }
  });
}

// Insertar datos de ejemplo
function insertSampleData() {
  const sampleData = [
    {
      sender: 'Juan Pérez',
      receiver: 'María García',
      amount: 1500.00
    },
    {
      sender: 'Carlos López',
      receiver: 'Ana Rodríguez',
      amount: 2500.00
    },
    {
      sender: 'Luis Martínez',
      receiver: 'Carmen Silva',
      amount: 800.00
    },
    {
      sender: 'Roberto Díaz',
      receiver: 'Patricia Torres',
      amount: 3200.00
    },
    {
      sender: 'Fernando Ruiz',
      receiver: 'Isabel Vargas',
      amount: 1200.00
    }
  ];

  const insertSQL = 'INSERT INTO transfers (sender, receiver, amount) VALUES (?, ?, ?)';
  
  sampleData.forEach((data) => {
    db.run(insertSQL, [data.sender, data.receiver, data.amount], function(err) {
      if (err) {
        console.error('Error insertando dato de ejemplo:', err.message);
      } else {
        console.log(`Dato de ejemplo insertado con ID: ${this.lastID}`);
      }
    });
  });
}

// Rutas de la API

// GET /transfers - Listar todas las transferencias
app.get('/transfers', (req, res) => {
  const sql = 'SELECT * FROM transfers ORDER BY date DESC';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ 
        error: 'Error al obtener las transferencias',
        details: err.message 
      });
      return;
    }
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  });
});

// POST /transfers - Crear una nueva transferencia
app.post('/transfers', (req, res) => {
  const { sender, receiver, amount } = req.body;
  
  // Validación de datos requeridos
  if (!sender || !receiver || !amount) {
    return res.status(400).json({
      error: 'Todos los campos son requeridos: sender, receiver, amount'
    });
  }
  
  // Validación de monto positivo
  if (amount <= 0) {
    return res.status(400).json({
      error: 'El monto debe ser mayor a 0'
    });
  }

  const sql = 'INSERT INTO transfers (sender, receiver, amount) VALUES (?, ?, ?)';
  const params = [sender, receiver, amount];
  
  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ 
        error: 'Error al crear la transferencia',
        details: err.message 
      });
      return;
    }
    
    // Obtener la transferencia creada
    db.get('SELECT * FROM transfers WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        res.status(500).json({ 
          error: 'Error al obtener la transferencia creada',
          details: err.message 
        });
        return;
      }
      res.status(201).json({
        success: true,
        message: 'Transferencia creada exitosamente',
        data: row
      });
    });
  });
});

// PUT /transfers/:id - Actualizar una transferencia
app.put('/transfers/:id', (req, res) => {
  const { id } = req.params;
  const { sender, receiver, amount } = req.body;
  
  // Validación de datos requeridos
  if (!sender || !receiver || !amount) {
    return res.status(400).json({
      error: 'Todos los campos son requeridos: sender, receiver, amount'
    });
  }
  
  // Validación de monto positivo
  if (amount <= 0) {
    return res.status(400).json({
      error: 'El monto debe ser mayor a 0'
    });
  }

  const sql = 'UPDATE transfers SET sender = ?, receiver = ?, amount = ? WHERE id = ?';
  const params = [sender, receiver, amount, id];
  
  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ 
        error: 'Error al actualizar la transferencia',
        details: err.message 
      });
      return;
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ 
        error: 'Transferencia no encontrada' 
      });
    }
    
    // Obtener la transferencia actualizada
    db.get('SELECT * FROM transfers WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(500).json({ 
          error: 'Error al obtener la transferencia actualizada',
          details: err.message 
        });
        return;
      }
      res.json({
        success: true,
        message: 'Transferencia actualizada exitosamente',
        data: row
      });
    });
  });
});

// DELETE /transfers/:id - Eliminar una transferencia
app.delete('/transfers/:id', (req, res) => {
  const { id } = req.params;
  
  const sql = 'DELETE FROM transfers WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      res.status(500).json({ 
        error: 'Error al eliminar la transferencia',
        details: err.message 
      });
      return;
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ 
        error: 'Transferencia no encontrada' 
      });
    }
    
    res.json({
      success: true,
      message: 'Transferencia eliminada exitosamente',
      id: id
    });
  });
});

// GET /transfers/:id - Obtener una transferencia específica
app.get('/transfers/:id', (req, res) => {
  const { id } = req.params;
  
  const sql = 'SELECT * FROM transfers WHERE id = ?';
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).json({ 
        error: 'Error al obtener la transferencia',
        details: err.message 
      });
      return;
    }
    
    if (!row) {
      return res.status(404).json({ 
        error: 'Transferencia no encontrada' 
      });
    }
    
    res.json({
      success: true,
      data: row
    });
  });
});

// Ruta de prueba/health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    database: 'SQLite',
    endpoints: [
      'GET /transfers',
      'POST /transfers',
      'PUT /transfers/:id',
      'DELETE /transfers/:id',
      'GET /transfers/:id'
    ]
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Transferencias',
    version: '1.0.0',
    endpoints: {
      'GET /transfers': 'Listar todas las transferencias',
      'POST /transfers': 'Crear una nueva transferencia',
      'PUT /transfers/:id': 'Actualizar una transferencia',
      'DELETE /transfers/:id': 'Eliminar una transferencia',
      'GET /transfers/:id': 'Obtener una transferencia específica',
      'GET /health': 'Verificar estado del servidor'
    }
  });
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log('📊 Endpoints disponibles:');
  console.log('  GET  /transfers     - Listar todas las transferencias');
  console.log('  POST /transfers     - Crear nueva transferencia');
  console.log('  PUT  /transfers/:id - Actualizar transferencia');
  console.log('  DELETE /transfers/:id - Eliminar transferencia');
  console.log('  GET  /transfers/:id - Obtener transferencia específica');
  console.log('  GET  /health        - Verificar estado del servidor');
  console.log('  GET  /              - Información de la API');
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  db.close((err) => {
    if (err) {
      console.error('Error cerrando la base de datos:', err.message);
    } else {
      console.log('✅ Base de datos cerrada correctamente');
    }
    process.exit(0);
  });
}); 