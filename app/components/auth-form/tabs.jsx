import React from 'react'

export const Tabs = ({ classes, onLogin, handleTabSwitch }) => {
  return (
    <div className={classes.tabs}>
      <Tab
        handleClick={() => handleTabSwitch(false)}
        classes={!onLogin ? classes.activeTab : classes.nonActiveTab}
        tabText="Join"
      />
      <Tab
        handleClick={() => handleTabSwitch(true)}
        classes={onLogin ? classes.activeTab : classes.nonActiveTab}
        tabText="Login"
      />
    </div>
  )
}

export const Tab = ({ classes, handleClick, tabText }) => {
  return (
    <div className={classes} onClick={() => handleClick()}>
      {tabText}
    </div>
  )
}
