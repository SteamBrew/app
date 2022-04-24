import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './App.css';

function App() {
  const [themes, setThemes] = useState([]);
  const [selectorTheme, setSelectorTheme] = useState('');
  const [currentTheme, setCurrentTheme] = useState('');

  useEffect(() => {
    fetch("http://localhost:3000/keyboard/get")
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result)
          setThemes(result.themes);
          setCurrentTheme(result.current);
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          console.log(error)
        }
      )
  }, [])

  const handleSelectionChange = (event) => {
    setSelectorTheme(event.target.value)
  }

  const setTheme = () => {
    console.log(selectorTheme)
    fetch(`http://localhost:3000/keyboard/set/${selectorTheme}`).then(()=> {
      setCurrentTheme(selectorTheme)
    }, (error) => {
      console.log(error)
    })

  }

  return (
    <div className="App">
      <h1>Keyboard themes</h1>
      <p>Current theme is: {currentTheme}</p>
      <Button>
        Remove current theme
      </Button>
      <Button>
        Install new theme
      </Button>
      <Button>
        Refresh themes
      </Button>

      <div>
      <Form.Select aria-label="Default select example" onChange={handleSelectionChange} defaultValue='Default'>

        {
          themes.map(name => {
            return <option value={name}>{name}</option>
          })
        }
        </Form.Select>
        <Button onClick={setTheme}>Select</Button>
      </div>
    </div>
  );
}

export default App;
