import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import './App.css';

function App() {
  const [themes, setThemes] = useState([]);
  const [installableThemes, setInstallableThemes] = useState([]);
  const [currentTheme, setCurrentTheme] = useState('');

  const [installForm, setInstallForm] = useState({
    name: '',
    url: ''
  })

  const [showInstallModal, setShowInstallModal] = useState(false);

  const toggleInstallModal = () => {
    setShowInstallModal(!showInstallModal)
  }

  const refreshThemes = () => {
    getInstalledThemes()
    getInstallableThemes()
  }

  const getInstalledThemes = () => {
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
  }

  const getInstallableThemes = () => {
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
  }

  useEffect(() => {
    refreshThemes()
  }, [])


  const setTheme = (e) => {
    const selectorTheme = e.target.value
    console.log(selectorTheme)
    fetch(`http://localhost:3000/keyboard/set/${selectorTheme}`).then(()=> {
      setCurrentTheme(themes.find((theme)=>theme._id ==selectorTheme))
    }, (error) => {
      console.log(error)
    })
  }

  const installTheme = (e) => {
    const themeId = e.target.value
    const theme = installableThemes.find(theme => theme._id === themeId)
    if (theme) {
      fetch(`http://localhost:3000/keyboard/install`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({...theme})
      }).then(()=> {
        refreshThemes()
      }, (error) => {
        console.log(error)
      })
    }
  }

  const installManualTheme = () => {
    if (installForm.name && installForm.url) {
      fetch(`http://localhost:3000/keyboard/install`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({...installForm})
      }).then(()=> {
        refreshThemes()
      }, (error) => {
        console.log(error)
      })
    }
  }

  const deleteTheme = (e) => {
    const themeId = e.target.value
    fetch(`http://localhost:3000/keyboard/delete`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({_id: themeId})
    }).then(()=> {
      refreshThemes()
    }, (error) => {
      console.log(error)
    })
  }

  return (
    <div className="App">
      <h1>Keyboard themes</h1>
      <p>Current theme is: {currentTheme.name}</p>
      <Button onClick={toggleInstallModal} >
        Install theme from url
      </Button>
      <Button>
        Refresh themes
      </Button>

      <Modal show={showInstallModal} onHide={toggleInstallModal}>
        <Modal.Header closeButton>
          <Modal.Title>Install theme</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Theme name</Form.Label>
            <Form.Control type="name" placeholder="Theme" value={installForm.name} onChange={(e)=>{setInstallForm({...installForm, name: e.target.value})}} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Theme url</Form.Label>
            <Form.Control type="name" placeholder="https://" value={installForm.url} onChange={(e)=>{setInstallForm({...installForm, url: e.target.value})}} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={toggleInstallModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => {
            installManualTheme()
            toggleInstallModal()
            installForm.name = ''
            installForm.url = ''
          }}>
            Install
          </Button>
        </Modal.Footer>
      </Modal>

      <div>
        <h1>Installed themes</h1>
        <div>
          {
            themes.map(theme => (
              <div>
                <p>{theme.name}</p>
                <Button onClick={setTheme} value={theme._id}>{theme._id === currentTheme._id ? 'Selected' : 'Select'}</Button>
                {
                  theme._id !== currentTheme._id && theme._id !== "0" ?
                    <Button onClick={deleteTheme} value={theme._id} variant="danger">Remove theme</Button>
                  :
                    null
                }
                
              </div>
            ))
          }
        </div>
      </div>

      <h1>Find new themes</h1>
      {
        installableThemes.map(theme => (
          <div>
            <p>{theme.name}</p>
            {
              themes.find(installedTheme => theme._id === installedTheme._id) ? 
                <Button>Installed</Button> :
                <Button value={theme._id} onClick={installTheme}>Install</Button> 
            }
          </div>
        ))
      }
    </div>
  );
}

export default App;
