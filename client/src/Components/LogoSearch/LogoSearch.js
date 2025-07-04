import React from 'react'
import './LogoSearch.css'
import Logo from '../../Img/logo2.png';
import SearchIcon from '@mui/icons-material/Search';

const LogoSearch = () => {
  return (
    <div className='LogoSearch' >

      <img src={Logo} alt=""  style={{width: '68px', height: '40px', marginLeft: '5 px'}}/>

      <div className="Search">
        <input type="text" placeholder='#Search' />

        <div className="s-icon">
          <SearchIcon />
        </div>
      </div>

    </div>
  )
}

export default LogoSearch