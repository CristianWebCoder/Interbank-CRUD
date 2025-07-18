const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Función para hacer peticiones HTTP
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('Error en la petición:', error.message);
    return { status: 500, data: { error: error.message } };
  }
}

// Función para mostrar resultados
function showResult(testName, result) {
  console.log(`\n🧪 ${testName}`);
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
}

// Pruebas de la API
async function testAPI() {
  console.log('🚀 Iniciando pruebas de la API...\n');

  // 1. Verificar estado del servidor
  let result = await makeRequest(`${BASE_URL}/health`);
  showResult('Health Check', result);

  // 2. Obtener todas las transferencias
  result = await makeRequest(`${BASE_URL}/transfers`);
  showResult('GET /transfers - Listar todas', result);

  // 3. Crear una nueva transferencia
  const newTransfer = {
    sender: 'Test User',
    receiver: 'Test Receiver',
    amount: 1000.50
  };

  result = await makeRequest(`${BASE_URL}/transfers`, {
    method: 'POST',
    body: JSON.stringify(newTransfer)
  });
  showResult('POST /transfers - Crear nueva', result);

  let transferId = null;
  if (result.data.success && result.data.data) {
    transferId = result.data.data.id;
  }

  // 4. Obtener una transferencia específica
  if (transferId) {
    result = await makeRequest(`${BASE_URL}/transfers/${transferId}`);
    showResult(`GET /transfers/${transferId} - Obtener específica`, result);
  }

  // 5. Actualizar una transferencia
  if (transferId) {
    const updateData = {
      sender: 'Updated Sender',
      receiver: 'Updated Receiver',
      amount: 2000.75
    };

    result = await makeRequest(`${BASE_URL}/transfers/${transferId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    showResult(`PUT /transfers/${transferId} - Actualizar`, result);
  }

  // 6. Verificar la actualización
  if (transferId) {
    result = await makeRequest(`${BASE_URL}/transfers/${transferId}`);
    showResult(`GET /transfers/${transferId} - Verificar actualización`, result);
  }

  // 7. Eliminar la transferencia de prueba
  if (transferId) {
    result = await makeRequest(`${BASE_URL}/transfers/${transferId}`, {
      method: 'DELETE'
    });
    showResult(`DELETE /transfers/${transferId} - Eliminar`, result);
  }

  // 8. Verificar que fue eliminada
  if (transferId) {
    result = await makeRequest(`${BASE_URL}/transfers/${transferId}`);
    showResult(`GET /transfers/${transferId} - Verificar eliminación`, result);
  }

  // 9. Prueba de validación - Crear con datos inválidos
  const invalidTransfer = {
    sender: '',
    receiver: '',
    amount: -100
  };

  result = await makeRequest(`${BASE_URL}/transfers`, {
    method: 'POST',
    body: JSON.stringify(invalidTransfer)
  });
  showResult('POST /transfers - Validación de datos inválidos', result);

  // 10. Prueba de ruta no encontrada
  result = await makeRequest(`${BASE_URL}/ruta-inexistente`);
  showResult('GET /ruta-inexistente - Ruta no encontrada', result);

  console.log('\n✅ Pruebas completadas');
}

// Ejecutar las pruebas
if (require.main === module) {
  testAPI().catch(console.error);
}

module.exports = { testAPI, makeRequest }; 