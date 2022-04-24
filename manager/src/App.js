import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Keyboard themes</h1>
      <p>Current theme is:</p>
      <Button>
        Remove current theme
      </Button>

      <div>
      <Form.Select aria-label="Default select example">

        {
          ["Dark", "Test", "SteamGreen"].map(name => {
            return <option value={name}>{name}</option>
          })
        }
        </Form.Select>
        <Button>Select</Button>
      </div>
    </div>
  );
}

export default App;
