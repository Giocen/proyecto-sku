document.getElementById('sku-form').addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
  const data = {
    sku: document.getElementById('sku').value,
    ubicacion: document.getElementById('ubicacion').value,
    cantidad: document.getElementById('cantidad').value,
  };
  
  try {
    // Realizar la solicitud POST
    const res = await fetch('https://script.google.com/a/macros/liverpool.com.mx/s/AKfycbzsWQqvmoirPuX8jam5j-OrDF1tp0IrH3wtti_7M2od2Q-lQiknteY3u02fgTfUPo26dA/exec', {
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