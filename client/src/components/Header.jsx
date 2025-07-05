import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';

function Header(props){
    return(
    <div>
      <Navbar bg="primary" expand="lg">
        <Navbar.Brand href="/">Assignment Website</Navbar.Brand>
        {props.loggedIn && (<Button onClick={()=> props.handleLogout()}>Logout</Button>)}
      </Navbar>
    </div>
    )
}

export default Header;