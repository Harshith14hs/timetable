let subjects = [];
let isSaved = false; // Track if the timetable is saved

// Event listener for form submission
document.getElementById('subjectForm').addEventListener('submit', function(event) {
    event.preventDefault();
    addSubject();
});

// Function to add a subject
function addSubject() {
    const subjectInput = document.getElementById('subjectInput').value;
    const sectionInput = document.getElementById('sectionInput').value;
    const hoursInput = parseInt(document.getElementById('hoursInput').value, 10);

    if (subjectInput.trim() !== "" && sectionInput.trim() !== "" && hoursInput > 0) {
        subjects.push({
            subject: subjectInput,
            section: sectionInput,
            hoursPerWeek: hoursInput
        });

        clearInputs();
        displaySubjects();
    }
}

// Function to display the entered subjects in a table format
function displaySubjects() {
    const subjectsTableBody = document.getElementById('subjects-table-body');
    subjectsTableBody.innerHTML = ''; // Clear existing rows

    subjects.forEach((subject, index) => {
        const row = document.createElement('tr');

        const subjectCell = document.createElement('td');
        subjectCell.textContent = subject.subject;

        const sectionCell = document.createElement('td');
        sectionCell.textContent = subject.section;

        const hoursCell = document.createElement('td');
        hoursCell.textContent = subject.hoursPerWeek;

        const actionCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editSubject(index);
        actionCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteSubject(index);
        actionCell.appendChild(deleteButton);

        row.appendChild(subjectCell);
        row.appendChild(sectionCell);
        row.appendChild(hoursCell);
        row.appendChild(actionCell); // Add action cell to row

        subjectsTableBody.appendChild(row);
    });
}

// Function to edit a subject
function editSubject(index) {
    const subject = subjects[index];
    document.getElementById('subjectInput').value = subject.subject;
    document.getElementById('sectionInput').value = subject.section;
    document.getElementById('hoursInput').value = subject.hoursPerWeek;

    subjects.splice(index, 1); // Remove subject to avoid duplicate
    displaySubjects();
}

// Function to delete a subject
function deleteSubject(index) {
    subjects.splice(index, 1); // Remove subject from the array
    displaySubjects(); // Refresh the display
}

// Function to clear input fields
function clearInputs() {
    document.getElementById('subjectInput').value = '';
    document.getElementById('sectionInput').value = '';
    document.getElementById('hoursInput').value = '';
}

// Event listener for generate button
document.getElementById('generateButton').addEventListener('click', generateTimetable);

// Function to generate the timetable
function generateTimetable() {
    if (isSaved) return; // Prevent generating a new timetable if already saved

    const timetableContainer = document.getElementById('timetable-container');
    timetableContainer.innerHTML = '';  // Clear existing tables

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00', '1:00-2:00', '2:00-3:00', '3:00-4:00'];

    // Group subjects by section
    const subjectsBySection = {};
    subjects.forEach(subject => {
        if (!subjectsBySection[subject.section]) {
            subjectsBySection[subject.section] = [];
        }
        subjectsBySection[subject.section].push(subject);
    });

    // Create timetable for each section
    for (const section in subjectsBySection) {
        const sectionUsedSlots = {}; // Independent used slots for this section
        createTimetableForSection(section, subjectsBySection[section], days, timeSlots, sectionUsedSlots);
    }
}

// Function to create a timetable for a specific section
function createTimetableForSection(section, subjects, days, timeSlots, sectionUsedSlots) {
    const timetableWrapper = document.createElement('div');
    timetableWrapper.className = 'timetable-wrapper';

    const sectionTitle = document.createElement('h3');
    sectionTitle.className = 'section-title';
    sectionTitle.textContent = `Section: ${section}`;
    timetableWrapper.appendChild(sectionTitle);

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Create table header
    const headerRow = document.createElement('tr');
    const timeHeader = document.createElement('th');
    timeHeader.textContent = 'Time Slot';
    headerRow.appendChild(timeHeader);

    days.forEach(day => {
        const dayHeader = document.createElement('th');
        dayHeader.textContent = day;
        headerRow.appendChild(dayHeader);
    });
    thead.appendChild(headerRow);

    // Create rows for each time slot
    timeSlots.forEach(slot => {
        const row = document.createElement('tr');
        
        const timeCell = document.createElement('td');
        timeCell.textContent = slot;
        row.appendChild(timeCell);

        days.forEach(() => {
            const dayCell = document.createElement('td');
            dayCell.classList.add('empty');
            row.appendChild(dayCell);
        });

        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    timetableWrapper.appendChild(table);
    document.getElementById('timetable-container').appendChild(timetableWrapper);

    // Fill timetable with subjects for the section
    fillTimetable(tbody, subjects, timeSlots, days, sectionUsedSlots);
}

// Function to fill the timetable without overlapping between sections
function fillTimetable(tbody, subjects, timeSlots, days, sectionUsedSlots) {
    subjects.forEach(subject => {
        let hoursScheduled = 0;

        // Collect available slots
        const availableSlots = getAvailableSlots(tbody, timeSlots, days, sectionUsedSlots);

        // Schedule the subject in random slots until hours are fulfilled
        for (let k = 0; k < availableSlots.length && hoursScheduled < subject.hoursPerWeek; k++) {
            const slot = availableSlots[k];
            const cell = tbody.children[slot.timeIndex].children[slot.dayIndex + 1]; // Skip the time column

            // Check if the slot is free
            if (cell.textContent === '') {
                cell.textContent = subject.subject;
                cell.classList.remove('empty');
                cell.classList.add('filled');
                markSlotUsed(slot.timeIndex, slot.dayIndex, sectionUsedSlots); // Mark this slot as used
                hoursScheduled++;
            }
        }
    });
}

// Function to get available slots that are not used
function getAvailableSlots(tbody, timeSlots, days, sectionUsedSlots) {
    const availableSlots = [];

    for (let i = 0; i < timeSlots.length; i++) {
        for (let j = 0; j < days.length; j++) {
            if (!isSlotUsed(i, j, sectionUsedSlots)) {
                availableSlots.push({ timeIndex: i, dayIndex: j });
            }
        }
    }

    shuffleArray(availableSlots); // Randomize available slots
    return availableSlots;
}

// Function to shuffle an array randomly
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Function to mark a time slot (i, j) as used for a section
function markSlotUsed(timeIndex, dayIndex, sectionUsedSlots) {
    sectionUsedSlots[`${timeIndex}-${dayIndex}`] = true; // Mark the slot as used for this section
}

// Function to check if a time slot (i, j) is already used for a section
function isSlotUsed(timeIndex, dayIndex, sectionUsedSlots) {
    return sectionUsedSlots[`${timeIndex}-${dayIndex}`] === true;
}

// Event listener for save button
document.getElementById('saveButton').addEventListener('click', () => {
    isSaved = true; // Mark timetable as saved
    document.getElementById('generateButton').disabled = true;    
});
