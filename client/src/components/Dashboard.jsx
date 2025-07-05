import { useNavigate } from 'react-router-dom';
import { Button, Container } from 'react-bootstrap';

function Dashboard({ user }) {
  const navigate = useNavigate();

  if (!user) return <p>🔒 Access denied. Please log in.</p>;

  return (
    <Container className="mt-4">
      <h2>Dashboard</h2>
      <p>Welcome, {user.name} ({user.role})</p>

      {user.role === 'teacher' && (
        <>
          <h4>👨‍🏫 Funzionalità docente</h4>
          <Button className="mb-2" onClick={() => navigate('/assignments/new')}>✏️ Crea nuovo assignment</Button><br />
          <Button className="mb-2" onClick={() => navigate('/assignments/evaluate')}>✅ Valuta assignment</Button><br />
          <Button onClick={() => navigate('/assignments/status')}>📊 Stato della classe</Button>
        </>
      )}

      {user.role === 'student' && (
        <>
          <h4>👨‍🎓 Funzionalità studente</h4>
          <Button className="mb-2" onClick={() => navigate('/assignments/open')}>📄 Assignment aperti</Button><br />
          <Button onClick={() => navigate('/assignments/closed')}>📈 Assignment chiusi + media</Button>
        </>
      )}
    </Container>
  );
}

export default Dashboard;
