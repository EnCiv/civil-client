import React from 'react'
import injectSheet from 'react-jss'

const styles = {
  shareIconSvg: {
    fill: 'white',
    pointerEvents: 'auto',
    '&:hover': {
      fill: 'white',
    },
  },
  shareSpan: {
    cursor: 'pointer',
    pointerEvents: 'auto',
  },
}
const SocialShareSVG = ({ classes, isOpen, handleClick }) => {
  return (
    <span className={classes.shareSpan} title="Share">
      <svg
        className={`ignore ${classes.shareIconSvg}`}
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        onClick={() => handleClick(!isOpen)}
      >
        <path
          className="ignore"
          d="M5 9c1.654 0 3 1.346 3 3s-1.346 3-3 3-3-1.346-3-3 1.346-3 3-3zm0-2c-2.762 0-5 2.239-5 5s2.238 5 5 5 5-2.239 5-5-2.238-5-5-5zm15 9c-1.165 0-2.204.506-2.935 1.301l-5.488-2.927c-.23.636-.549 1.229-.944 1.764l5.488 2.927c-.072.301-.121.611-.121.935 0 2.209 1.791 4 4 4s4-1.791 4-4-1.791-4-4-4zm0 6c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2zm0-22c-2.209 0-4 1.791-4 4 0 .324.049.634.121.935l-5.488 2.927c.395.536.713 1.128.944 1.764l5.488-2.927c.731.795 1.77 1.301 2.935 1.301 2.209 0 4-1.791 4-4s-1.791-4-4-4zm0 6c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2z"
        />
      </svg>
    </span>
  )
}
export default injectSheet(styles)(SocialShareSVG)