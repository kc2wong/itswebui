import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './NavBar.css'

export const NavBar = ({ onChange, onSearch }) => (
    <div className="NavBar">
        <div className="logo ms-font-xl">
            <strong>Awesome App</strong>
        </div>
    </div>
)

NavBar.propTypes = {
    onChange: PropTypes.func,
    onSearch: PropTypes.func,
}

NavBar.defaultProps = {
    onChange: (newValue) => console.log('SearchBox onChange fired: ' + newValue),
    onSearch: (newValue) => console.log('SearchBox onSearch fired: ' + newValue),
}
