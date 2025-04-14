document.getElementById('sku-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    sku: document.getElementById('sku').value,
    ubicacion: document.getElementById('ubicacion').value,
    cantidad: document.getElementById('cantidad').value,
  };
  const res = await fetch('https://script.google.com/macros/s/AKfyc.../exec', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
  const result = await res.json();
  alert(result.mensaje || 'Registrado');
});
