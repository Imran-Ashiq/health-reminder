const fs = require('fs');
const path = require('path');

class CustomExerciseManager {
    constructor() {
        this.customExercisesPath = path.join(__dirname, 'custom-exercises.json');
        this.customExercises = this.loadCustomExercises();
    }

    loadCustomExercises() {
        try {
            if (fs.existsSync(this.customExercisesPath)) {
                return JSON.parse(fs.readFileSync(this.customExercisesPath, 'utf8'));
            }
            return {};
        } catch (error) {
            console.error('Error loading custom exercises:', error);
            return {};
        }
    }

    saveCustomExercises() {
        try {
            fs.writeFileSync(this.customExercisesPath, JSON.stringify(this.customExercises, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving custom exercises:', error);
            return false;
        }
    }

    addExercise(category, exercise) {
        if (!this.customExercises[category]) {
            this.customExercises[category] = [];
        }
        this.customExercises[category].push(exercise);
        return this.saveCustomExercises();
    }

    deleteExercise(category, index) {
        if (this.customExercises[category] && this.customExercises[category][index]) {
            this.customExercises[category].splice(index, 1);
            
            // Remove category if empty
            if (this.customExercises[category].length === 0) {
                delete this.customExercises[category];
            }
            
            return this.saveCustomExercises();
        }
        return false;
    }

    getAllCategories() {
        return Object.keys(this.customExercises);
    }

    getExercisesInCategory(category) {
        return this.customExercises[category] || [];
    }
}

module.exports = CustomExerciseManager;