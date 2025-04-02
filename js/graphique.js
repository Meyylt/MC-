const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');

// 1. Configuration du graphique
const data = {
  labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'],
  datasets: [{
    label: 'Missions complétées',
    data: [15, 22, 18, 30],  // Remplacez par vos données réelles
    backgroundColor: '#36a2eb',
    borderColor: '#2288cc',
    borderWidth: 2
  }]
};

// 2. Options du graphique
const options = {
  plugins: {
    title: {
      display: true,
      text: 'Missions par semaine',
      font: { size: 18 }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Nombre de missions'
      }
    }
  }
};

// 3. Génération du graphique
(async () => {
  const canvas = new ChartJSNodeCanvas({
    width: 800,
    height: 400,
    backgroundColour: 'white'  // Fond transparent si omis
  });

  const image = await canvas.renderToBuffer({
    type: 'bar',  // Essayez aussi 'line' pour un graphique linéaire
    data,
    options
  });

  fs.writeFileSync('missions-semaine.png', image);
  console.log('✅ Graphique sauvegardé sous missions-semaine.png');
})();