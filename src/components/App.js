import React,{useState,useEffect}from "react";
import {BrowserRouter as Router ,Switch,Route} from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import api from '../api/contacts'
import './App.css';
import Header from "./Header";
import AddContact from "./AddContact";
import ContactList from "./ContactList";
import ContactDetail from "./ContactDetail";
import EditContact from "./EditContact";


function App() {
  const LOCAL_STORAGE_KEY = "contacts";
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);


  //RetrieveContacts from JSON server
  const retrieveContacts = async () => {
    const response = await api.get("/contacts");
    return response.data ;
  };

  const addContactHandler = async (contact) => {
    console.log(contact);
    const request = {
      id:uuidv4(),
      ...contact
    }
    const response = await api.post("/contacts", request)
    setContacts([...contacts, response.data])
  }

  //Edit/Update Contact

  const updateContactHandler = async (contact) =>{
    const response = await api.put(`/contacts/${contact.id}`, contact)
    const {id,name,email} = response.data;
    setContacts(
      contacts.map((contact) => {
      return contact.id === id ? {...response.data} : contact;
    })
    )
  }

  //Delete Contact
  const removeContactHandler = async (id)=>{
    await api.delete(`/contacts/${id}`);
    const newContactList = contacts.filter((contact) => {
      return contact.id !== id;
    });
    setContacts(newContactList)
  }

  //Filter contacts / Search Contacts

  const searchHandler = (searchTerm) => {
    setSearchTerm(searchTerm)
    if(searchTerm!== ""){
      const newContactList = contacts.filter((contact) => {
        return Object.values(contact).join(" ").toLowerCase().includes(searchTerm.toLowerCase());
      })
      setSearchResults(newContactList)
    }
    else{
      setSearchResults(contacts)
    }
  }

  //Another useeffect because when we refresh the page it should fetch the data form Local Storage
  useEffect(() => {
    // const retireveContacts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    // if(retireveContacts)setContacts(retireveContacts)
    const getAllContacts = async () =>{
      const allContacts = await retrieveContacts();
      if(allContacts) setContacts(allContacts)
    };
    getAllContacts();
  },[]);
  //Store the data in Local Storage
  useEffect(() => {
    //localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(contacts))
  },[contacts]);

  


  return (
    <div className="ui conatiner">
    <Router>
        <Header/>
        <Switch>
        <Route path="/" 
        exact 
        render={(props) =>
        (<ContactList {...props} contacts={searchTerm.length < 1 ? contacts : searchResults} getContactId={removeContactHandler} term={searchTerm} searchKeyword={searchHandler}/>)}/>
        <Route path="/add" 
        render={(props) => (<AddContact {...props} addContactHandler={addContactHandler} />)
        }/>
        <Route path="/edit" 
        render={(props) => (<EditContact {...props} updateContactHandler={updateContactHandler} />)
        }/>
        <Route path="/contact/:id" component={ContactDetail}/>
        </Switch>
    </Router>
    </div>
  );
}

export default App;
