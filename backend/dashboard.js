const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());

const milestones = {  // Initialize milestones with their bonus points
    "BEGINNER": { minPoints: 0, maxPoints: 19, color: "bg-primary", bonus: 0},
    "JOURNEYMAN": { minPoints: 20, maxPoints: 49, color: "bg-danger", bonus: 5},
    "EXPERT": { minPoints: 50, maxPoints: 119, color: "bg-warning", bonus: 10},
    "MASTER": { minPoints: 120, maxPoints: 250, color: "bg-success", bonus: 20},
};
   

const tasks = [  // Initialize tasks with their points
    { id:1, name:"Document API Endpoints", point:10 },
    { id:2, name:"Fix Bug in Login", point:30 },
    { id:3, name:"Deploy to Production", point:20 },
    { id:4, name:"Write Unit Tests for API", point:30 },
    { id:5, name:"Implement User Authentication", point:40 },
    { id:6, name:"Develop User Settings Page", point:50 }
];

let users = [  // users and their informations
    { id: 1, name: "John", points: 0, activities: { completed: [1, 2], milestone: null } },
    { id: 2, name: "James", points: 0, activities: { completed: [1], milestone: null } },
    { id: 3, name: "Michael", points: 0, activities: { completed: [1,4, 6], milestone: null } },
    { id: 4, name: "Sophia", points: 0, activities: { completed: [1, 3, 5], milestone: null } },
    { id: 5, name: "David", points: 0, activities: { completed: [2, 4], milestone: null } },
    { id: 6, name: "Olivia", points: 0, activities: { completed: [1, 2, 3, 4, 5, 6], milestone: null } },
    { id: 7, name: "Emily", points: 0, activities: { completed: [2, 3, 5], milestone: null } }
]

function updateMilestone() { // to check the level of milestone
    users.forEach(user => {
        let milestoneChanged = false; // this flag checks if there is milestone progression.
        for (let level in milestones) {
            const { minPoints, maxPoints, color, bonus } = milestones[level];
            if (user.points >= minPoints) {
                user.points += bonus;
                if(user.points < maxPoints){
                    if (!user.activities.milestone || user.activities.milestone.name !== level) { 
                        user.activities.milestone = { name: level, color: color, bonus: bonus }; // assigns milestone based on points.
                        milestoneChanged = true; // milestone is changed 
                    }
                    break;
                }  
            }
        }
        user.milestoneUpdated = milestoneChanged; // change is added into user array
        return
    });
}

function calculatePoint() { // to calculate points with using completed tasks for every user
    users.forEach(user => {
        let totalPoints = 0;
        user.points = totalPoints;
        user.activities.completed.forEach(taskId => {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                user.points += task.point;;
            }
        });
    });
    updateMilestone();
}



app.get('/tasks', (req, res) => {
    res.json(tasks);
});


// This block of code defines an endpoint in an Express.js server that handles the addition of a completed task to a user's activities.
/*
POST /points/add
Request body: { userId: <userId>, taskId: <taskId> }
- Finds user by userId
- Finds task by taskId
- Checks if task is already completed by the user
- If not completed, adds taskId to the user's completed tasks
- Recalculates points and updates milestone
Response: { message: "Task added successfully", user: <updatedUserData> }
 */

app.post('/points/add', (req, res) => {
    console.log("HERE");
    const { userId, taskId } = req.body;
    const user = users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }
    if (user.activities.completed.includes(taskId)) {
        return res.status(400).json({ message: "Task already completed" });
    }
    user.activities.completed.push(taskId);
    calculatePoint();
    

    res.json({ message: "Task added successfully", user});
});



app.get('/dashboard/summary', (req, res) => {
    calculatePoint();
    res.json(users.map(user => ({
        id: user.id,
        name: user.name,
        totalPoints: user.points,
        activities: user.activities,
        taskNames: user.activities.completed
            .map(taskId => tasks.find(task => task.id === taskId)?.name)
            .filter(taskName => taskName !== undefined) 
    })));
});



const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));