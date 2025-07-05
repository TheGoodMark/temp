import sqlite3 from 'sqlite3';
import crypto from 'crypto';

const db = new sqlite3.Database('assignments.sqlite', (err) => {
  if (err) throw err;
});

const hashPassword = (password, salt) => {
  return crypto.scryptSync(password, salt, 32).toString('hex');
};

// Dati realistici
const firstNames = ["Luca", "Giulia", "Marco", "Francesca", "Alessandro", "Sara", "Matteo", "Martina", "Davide", "Chiara",
  "Federico", "Elisa", "Simone", "Irene", "Gabriele", "Silvia", "Andrea", "Valentina", "Stefano", "Roberta"];
const lastNames = ["Rossi", "Bianchi", "Verdi", "Russo", "Ferrari", "Romano", "Gallo", "Costa", "Fontana", "Marino",
  "Lombardi", "Conti", "Giordano", "Esposito", "Moretti", "Barbieri", "Santoro", "Ferri", "Greco", "Pellegrini"];
const passwords = [...Array(10).fill("12345"), ...Array(10).fill("67890")];

db.serialize(() => {
  db.exec(`
    DROP TABLE IF EXISTS assignment_students;
    DROP TABLE IF EXISTS assignment;
    DROP TABLE IF EXISTS user;

    CREATE TABLE user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      surname TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      salt TEXT NOT NULL,
      saltedPassword TEXT NOT NULL,
      role TEXT CHECK(role IN ('student', 'teacher')) NOT NULL
    );

    CREATE TABLE assignment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT,
      score INTEGER CHECK(score BETWEEN 0 AND 30),
      status TEXT CHECK(status IN ('open', 'closed')) NOT NULL DEFAULT 'open',
      teacherId INTEGER NOT NULL,
      FOREIGN KEY (teacherId) REFERENCES user(id)
    );

    CREATE TABLE assignment_students (
      assignmentId INTEGER NOT NULL,
      studentId INTEGER NOT NULL,
      PRIMARY KEY (assignmentId, studentId),
      FOREIGN KEY (assignmentId) REFERENCES assignment(id),
      FOREIGN KEY (studentId) REFERENCES user(id)
    );
  `, (err) => {
    if (err) throw err;

    // Insert teachers
    const teachers = [
      ['Mario', 'Rossi', 'm.rossi@univ.it', 'teacher'],
      ['Laura', 'Bianchi', 'l.bianchi@univ.it', 'teacher']
    ];

    const teacherStmt = db.prepare('INSERT INTO user (name, surname, email, salt, saltedPassword, role) VALUES (?, ?, ?, ?, ?, ?)');
    teachers.forEach(([name, surname, email, role]) => {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = hashPassword('docente123', salt);
      teacherStmt.run(name, surname, email, salt, hash, role);
    });
    teacherStmt.finalize(() => console.log('✅ Docenti inseriti'));

    // Insert students
    const studentStmt = db.prepare('INSERT INTO user (name, surname, email, salt, saltedPassword, role) VALUES (?, ?, ?, ?, ?, ?)');
    for (let i = 0; i < 20; i++) {
      const name = firstNames[i];
      const surname = lastNames[i];
      const email = `studente${i + 1}@studenti.univ.it`;
      const salt = crypto.randomBytes(16).toString('hex');
      const password = passwords[i];
      const hash = hashPassword(password, salt);
      studentStmt.run(name, surname, email, salt, hash, 'student');
    }
    studentStmt.finalize(() => {
      console.log('✅ Studenti inseriti');

      // Inserimento assignment e gruppi
      const assignments = [
        {
          question: 'Spiega il ciclo di vita di un componente React',
          answer: 'Mounting, updating, unmounting...',
          score: 27,
          status: 'closed',
          teacherId: 1,
          group: [3, 4, 5]
        },
        {
          question: 'Cos\'è il Context API in React e quando usarlo?',
          answer: null,
          score: null,
          status: 'open',
          teacherId: 2,
          group: [6, 7, 8, 9]
        }
      ];

      const stmtAss = db.prepare('INSERT INTO assignment (question, answer, score, status, teacherId) VALUES (?, ?, ?, ?, ?)');
      const stmtGroup = db.prepare('INSERT INTO assignment_students (assignmentId, studentId) VALUES (?, ?)');

      assignments.forEach((a, i) => {
        stmtAss.run(a.question, a.answer, a.score, a.status, a.teacherId, function (err) {
          if (err) throw err;
          const aid = this.lastID;
          a.group.forEach(sid => stmtGroup.run(aid, sid));
          if (i === assignments.length - 1) {
            stmtAss.finalize();
            stmtGroup.finalize(() => {
              db.close();
              console.log('🎉 Database popolato correttamente!');
            });
          }
        });
      });
    });
  });
});
