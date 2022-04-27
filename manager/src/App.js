import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './App.css';

function App() {
  const [themes, setThemes] = useState([]);
  const [installableThemes, setInstallableThemes] = useState([]);
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
        (error) => {
          console.log(error)
        }
      )
    fetch("http://localhost:3002/keyboard/themes")
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result)
          setInstallableThemes(result);
        },
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
      setCurrentTheme(themes.find((theme)=>theme._id ==selectorTheme))
    }, (error) => {
      console.log(error)
    })
  }

  const installTheme = () => {

  }

  return (
    <div className="App">
      <h1>Keyboard themes</h1>
      <p>Current theme is: {currentTheme.name}</p>
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
        <p>Select theme:</p>
      <Form.Select 
        aria-label="Default select example" 
        onChange={handleSelectionChange} 
        defaultValue={currentTheme._id}>

        {
          themes.map(theme => {
            return <option value={theme._id}>{theme.name}</option>
          })
        }
        </Form.Select>
        <Button onClick={setTheme}>Select</Button>
      </div>

      <h1>Find new themes</h1>
      {
        installableThemes.map(theme => (
          <div>
            <p>{theme.name}</p>
            {
              themes.includes(theme.name) ? 
                <Button>Installed</Button> :
                <Button>Install</Button> 
            }
          </div>
        ))
      }
    </div>
  );
}

export default App;
