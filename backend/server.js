const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conectar a la base de datos SQLite
const dbPath = path.join(__dirname, 'database', 'transferencias.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite');
  }
});

// Rutas de la API

// GET - Obtener todas las transferencias
app.get('/api/transferencias', (req, res) => {
  const sql = 'SELECT * FROM transferencias ORDER BY fecha_creacion DESC';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Transferencias obtenidas exitosamente',
      data: rows
    });
  });
});

// POST - Crear nueva transferencia
app.post('/api/transferencias', (req, res) => {
  const { monto, cuenta_origen, cuenta_destino, descripcion, tipo } = req.body;
  
  if (!monto || !cuenta_origen || !cuenta_destino) {
    return res.status(400).json({ error: 'Monto, cuenta origen y cuenta destino son requeridos' });
  }

  const sql = `
    INSERT INTO transferencias (monto, cuenta_origen, cuenta_destino, descripcion, tipo, fecha_creacion)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `;
  
  const params = [monto, cuenta_origen, cuenta_destino, descripcion || '', tipo || 'transferencia'];
  
  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Obtener la transferencia creada
    db.get('SELECT * FROM transferencias WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({
        message: 'Transferencia creada exitosamente',
        data: row
      });
    });
  });
});

// PUT - Actualizar transferencia
app.put('/api/transferencias/:id', (req, res) => {
  const { id } = req.params;
  const { monto, cuenta_origen, cuenta_destino, descripcion, tipo, estado } = req.body;
  
  const sql = `
    UPDATE transferencias 
    SET monto = ?, cuenta_origen = ?, cuenta_destino = ?, descripcion = ?, tipo = ?, estado = ?, fecha_actualizacion = datetime('now')
    WHERE id = ?
  `;
  
  const params = [monto, cuenta_origen, cuenta_destino, descripcion, tipo, estado, id];
  
  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Transferencia no encontrada' });
    }
    
    // Obtener la transferencia actualizada
    db.get('SELECT * FROM transferencias WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        message: 'Transferencia actualizada exitosamente',
        data: row
      });
    });
  });
});

// DELETE - Eliminar transferencia
app.delete('/api/transferencias/:id', (req, res) => {
  const { id } = req.params;
  
  const sql = 'DELETE FROM transferencias WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Transferencia no encontrada' });
    }
    
    res.json({
      message: 'Transferencia eliminada exitosamente',
      id: id
    });
  });
});

// GET - Obtener estadísticas
app.get('/api/estadisticas', (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) as total_transferencias,
      SUM(monto) as monto_total,
      AVG(monto) as monto_promedio,
      COUNT(CASE WHEN estado = 'completada' THEN 1 END) as transferencias_completadas,
      COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as transferencias_pendientes
    FROM transferencias
  `;
  
  db.get(sql, [], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Estadísticas obtenidas exitosamente',
      data: row
    });
  });
});

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  console.log('Endpoints disponibles:');
  console.log('- GET  /api/transferencias');
  console.log('- POST /api/transferencias');
  console.log('- PUT  /api/transferencias/:id');
  console.log('- DELETE /api/transferencias/:id');
  console.log('- GET  /api/estadisticas');
  console.log('- GET  /api/health');
}); 