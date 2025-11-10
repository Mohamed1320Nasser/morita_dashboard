import React from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from '@/components/atoms/buttons/button'
import { Cross } from '@/components/atoms/icons'

const DeleteConfirmModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  title = 'Delete',
  itemName = '',
  itemType = 'item',
  loading = false 
}) => {
  return (
    <Modal centered show={show} onHide={onHide}>
      <Modal.Body>
        <div className="modalHead">
          <h6>Delete {itemType}</h6>
          <button onClick={onHide} disabled={loading}>
            <Cross />
          </button>
        </div>
        <div className="modalBody">
          <h5>Delete &quot;{itemName}&quot; {itemType}!</h5>
          <p>Are you sure to Delete this {itemType}?</p>
        </div>
        <div className="modalFooter">
          <Button onClick={onConfirm} danger disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
          <Button onClick={onHide} cancel disabled={loading}>
            Cancel
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default DeleteConfirmModal
