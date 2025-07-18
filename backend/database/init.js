const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Crear directorio database si no existe
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Ruta de la base de datos
const dbPath = path.join(__dirname, 'transferencias.db');

// Conectar a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err.message);
    process.exit(1);
  }
  console.log('Conectado a la base de datos SQLite');
});

// Crear tabla de transferencias
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS transferencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    monto DECIMAL(10,2) NOT NULL,
    cuenta_origen VARCHAR(50) NOT NULL,
    cuenta_destino VARCHAR(50) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(20) DEFAULT 'transferencia',
    estado VARCHAR(20) DEFAULT 'pendiente',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.run(createTableSQL, (err) => {
  if (err) {
    console.error('Error creando la tabla:', err.message);
    process.exit(1);
  }
  console.log('Tabla transferencias creada exitosamente');
  
  // Insertar datos de ejemplo
  insertSampleData();
});

function insertSampleData() {
  const sampleData = [
    {
      monto: 1500.00,
      cuenta_origen: '0011-0101-0100000001',
      cuenta_destino: '0011-0101-0100000002',
      descripcion: 'Pago de servicios',
      tipo: 'pago',
      estado: 'completada'
    },
    {
      monto: 2500.00,
      cuenta_origen: '0011-0101-0100000003',
      cuenta_destino: '0011-0101-0100000004',
      descripcion: 'Transferencia entre cuentas',
      tipo: 'transferencia',
      estado: 'pendiente'
    },
    {
      monto: 800.00,
      cuenta_origen: '0011-0101-0100000005',
      cuenta_destino: '0011-0101-0100000006',
      descripcion: 'Pago de factura',
      tipo: 'pago',
      estado: 'completada'
    },
    {
      monto: 3200.00,
      cuenta_origen: '0011-0101-0100000007',
      cuenta_destino: '0011-0101-0100000008',
      descripcion: 'Transferencia de fondos',
      tipo: 'transferencia',
      estado: 'pendiente'
    },
    {
      monto: 1200.00,
      cuenta_origen: '0011-0101-0100000009',
      cuenta_destino: '0011-0101-0100000010',
      descripcion: 'Pago de nómina',
      tipo: 'nomina',
      estado: 'completada'
    }
  ];

  const insertSQL = `
    INSERT INTO transferencias (monto, cuenta_origen, cuenta_destino, descripcion, tipo, estado)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  let completed = 0;
  sampleData.forEach((data) => {
    const params = [
      data.monto,
      data.cuenta_origen,
      data.cuenta_destino,
      data.descripcion,
      data.tipo,
      data.estado
    ];

    db.run(insertSQL, params, function(err) {
      if (err) {
        console.error('Error insertando dato de ejemplo:', err.message);
      } else {
        console.log(`Dato de ejemplo insertado con ID: ${this.lastID}`);
      }
      
      completed++;
      if (completed === sampleData.length) {
        console.log('Inicialización de la base de datos completada');
        console.log(`Base de datos creada en: ${dbPath}`);
        db.close((err) => {
          if (err) {
            console.error('Error cerrando la base de datos:', err.message);
          } else {
            console.log('Conexión a la base de datos cerrada');
          }
          process.exit(0);
        });
      }
    });
  });
} 