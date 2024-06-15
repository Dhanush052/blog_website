import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "./userContext";

export default function Header(){
  const {setUserInfo,userInfo} = useContext(UserContext);
  useEffect(() => {
    fetch('http://localhost:4000/profile',{
      credentials:'include',
    }).then(response => {
      response.json().then(userInfo => {
       setUserInfo(userInfo); 
      });
    });
  }, []);
  function logout(){
    fetch('http://localhost:4000/logout',{
      credentials: 'include',
      method: 'POST'
    });
    setUserInfo(null);
  }

  const username = userInfo?.username;
    return(
        <header className="headerFile">
        <Link to="/" className ="logo">MY BLOG</Link>
        <nav>
          {username && (
            <div className="xnxx">
            <div className="xxx"><Link to="/create">Create new post</Link></div>
            <button onClick={()=>logout()}>Logout</button>
            </div>
          )}
          {!username && (
            <>
             <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
            </>
          )}
         
        </nav>
      </header>
    );
}