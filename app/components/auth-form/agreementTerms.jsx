import React from 'react'
import Icon from '../lib/icon'
import IconBoxChecked from '../../svgr/box-checked'
import IconBoxEmpty from '../../svgr/box-empty'

export const AgreementTerms = ({ setHasAgreed, hasAgreed, classes }) => {
  return (
    <div className={classes}>
      {hasAgreed ? (
        <IconBoxChecked onClick={() => setHasAgreed(!hasAgreed)} />
      ) : (
        <IconBoxEmpty onClick={() => setHasAgreed(!hasAgreed)} />
      )}
      <span>
        I agree to the{' '}
        <a href="https://enciv.org/terms/" target="_blank" style={{ color: '#18397D' }}>
          Terms of Service
        </a>{' '}
      </span>
    </div>
  )
}
