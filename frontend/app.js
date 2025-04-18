document.getElementById('sku-form').addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
  const data = {
    sku: document.getElementById('sku').value,
    ubicacion: document.getElementById('ubicacion').value,
    cantidad: document.getElementById('cantidad').value,
  };
  
  try {
    // Realizar la solicitud POST
    const res = await fetch('https://script.google.com/a/macros/liverpool.com.mx/s/AKfycbx1LQajUVXwClH4q-ez4ZzevPlJ9RrhCO_K5F-RciHAwEvi4EKQYClSU4-pIW4Lh6e8/exec', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });

    // Verificar si la respuesta fue exitosa (código de estado 200-299)
    if (!res.ok) {
      throw new Error('Error en la solicitud');
    }

    const result = await res.json();

    // Mostrar mensaje de éxito o el mensaje devuelto por el script
    alert(result.mensaje || '¡Registro exitoso!');

    // Limpiar los campos después de registrar
    document.getElementById('sku').value = '';
    document.getElementById('ubicacion').value = '';
    document.getElementById('cantidad').value = '';
  } catch (error) {
    // En caso de error, mostrar un mensaje de error
    alert('Hubo un problema al registrar los datos: ' + error.message);
  }
});