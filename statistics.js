const { ipcRenderer } = require('electron');

class StatisticsManager {
    constructor() {
        this.hydrationChart = null;
        this.exerciseChart = null;
        this.currentView = 'weekly';
        this.initializeCharts();
        this.bindEvents();
        this.loadData();
    }

    initializeCharts() {
        // Hydration Chart
        const hydrationCtx = document.getElementById('hydrationChart').getContext('2d');
        this.hydrationChart = new Chart(hydrationCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Hydration Count',
                    data: [],
                    borderColor: '#4CAF50',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            stepSize: 1,
                            color: 'var(--chart-text)' // Use theme-aware text color
                        }
                    },
                    x: {
                        ticks: { 
                            color: 'var(--chart-text)' // Use theme-aware text color
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'var(--chart-text)' // Legend text color
                        }
                    }
                }
            }
        });
    
        // Exercise Chart
        const exerciseCtx = document.getElementById('exerciseChart').getContext('2d');
        this.exerciseChart = new Chart(exerciseCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Exercise Count',
                    data: [],
                    backgroundColor: '#2196F3'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            stepSize: 1,
                            color: 'var(--chart-text)' // Use theme-aware text color
                        }
                    },
                    x: {
                        ticks: { 
                            color: 'var(--chart-text)' // Use theme-aware text color
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'var(--chart-text)' // Legend text color
                        }
                    }
                }
            }
        });
    }

    bindEvents() {
        document.getElementById('weeklyBtn').addEventListener('click', () => this.switchView('weekly'));
        document.getElementById('monthlyBtn').addEventListener('click', () => this.switchView('monthly'));
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
    }

    async loadData() {
        const stats = await this.getStatsForView();
        this.updateCharts(stats);
        this.updateSummary(stats);
    }

    getStatsForView() {
        const stats = JSON.parse(localStorage.getItem('healthStats') || '{}');
        const days = this.currentView === 'weekly' ? 7 : 30;
        const filteredStats = {};
        
        const dates = Object.keys(stats).sort().slice(-days);
        dates.forEach(date => {
            filteredStats[date] = stats[date];
        });
        
        return filteredStats;
    }

    updateCharts(stats) {
        const dates = Object.keys(stats);
        const hydrationData = dates.map(date => stats[date].hydrationCount || 0);
        const exerciseData = dates.map(date => stats[date].exerciseCount || 0);

        this.hydrationChart.data.labels = dates.map(date => new Date(date).toLocaleDateString());
        this.hydrationChart.data.datasets[0].data = hydrationData;
        this.hydrationChart.update();

        this.exerciseChart.data.labels = dates.map(date => new Date(date).toLocaleDateString());
        this.exerciseChart.data.datasets[0].data = exerciseData;
        this.exerciseChart.update();
    }

    updateSummary(stats) {
        const totalHydration = Object.values(stats).reduce((sum, day) => sum + (day.hydrationCount || 0), 0);
        const totalExercises = Object.values(stats).reduce((sum, day) => sum + (day.exerciseCount || 0), 0);
        const completionRate = ((totalExercises / (Object.keys(stats).length || 1)) * 100).toFixed(1);

        document.getElementById('totalHydration').textContent = totalHydration;
        document.getElementById('totalExercises').textContent = totalExercises;
        document.getElementById('completionRate').textContent = `${completionRate}%`;
    }

    switchView(view) {
        this.currentView = view;
        document.querySelectorAll('.time-range button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${view}Btn`).classList.add('active');
        this.loadData();
    }

    exportData() {
        const stats = JSON.parse(localStorage.getItem('healthStats') || '{}');
        const csvContent = this.convertToCSV(stats);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `health_statistics_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }

    convertToCSV(stats) {
        const headers = ['Date', 'Hydration Count', 'Exercise Count'];
        const rows = Object.entries(stats).map(([date, data]) => {
            return [date, data.hydrationCount || 0, data.exerciseCount || 0];
        });
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}

// Initialize statistics when page loads
document.addEventListener('DOMContentLoaded', () => {
    new StatisticsManager();
});