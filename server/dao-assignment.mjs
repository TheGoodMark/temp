import db from './db.mjs';

export const getAssignmentsByTeacher = (teacherId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT * FROM assignment
      WHERE teacherId = ?
      ORDER BY id DESC
    `;
    db.all(sql, [teacherId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const getAssignmentsByStudent = (studentId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT a.* FROM assignment a
      JOIN assignment_students s ON s.assignmentId = a.id
      WHERE s.studentId = ?
      ORDER BY a.id DESC
    `;
    db.all(sql, [studentId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
