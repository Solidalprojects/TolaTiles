import React from "react"
import { Link } from 'react-router-dom';
import logo from '../assets/react.svg'
const Navbar = () => {


  return (
    <>
      <nav className="bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
             <Link to="/" className="flex items-center space-x-2">
              <img 
                src={logo} 
                alt="Tola Tiles" 
                className="h-12 w-auto"
              />
            </Link>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar