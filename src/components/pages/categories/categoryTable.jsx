import React, { useEffect, useRef, useState } from "react";
import { AddUser, Cross, Menu, RemoveUser } from "@/components/atoms/icons";
import { AiOutlineEdit, AiOutlineInfoCircle, } from "react-icons/ai";
import Loading from "@/components/atoms/loading";
import moment from "moment";
import { useRouter } from "next/router";
import Modal from "react-bootstrap/Modal";
import Button from "@/components/atoms/buttons/button";

import { ToastContainer, toast } from "react-toastify";
import { Slide } from "react-toastify";
import { LuTrash2 } from "react-icons/lu";
import category from "@/controllers/category";

import { notify } from "@/config/error";
import Badge from "@/components/atoms/badge";

const Table = ({ columns, data, onRefresh, loading }) => {
  const [menu, setMenu] = useState(false);
  const router = useRouter();
  const userMenuRef = useRef(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    let handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  });

  const handleCloseDeleteModal = () => setShowDeleteModal(false);
  const handleCloseStatusModal = () => setShowStatusModal(false);

  const handleDeleteCategoryShow = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleStatusShow = (category) => {
    setSelectedCategory(category);
    setShowStatusModal(true);
  };

  const handleStatusFlip = async () => {
    const response = await category.flipStatus(selectedCategory.id);
    if (response && !response.error) {
      Success(`Category has been ${!selectedCategory.active ? "Inactive" : "Active"} Successfully`);
      handleCloseStatusModal();
      onRefresh();
    }
  };

  const Success = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  const handleDeleteCategory = async () => {
    try {
      const response = await category.deleteCategory(selectedCategory.id);
      if (response && !response.error) {
        Success("Category deleted successfully");
        handleCloseDeleteModal();
        onRefresh();
      } else {
        notify("Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      notify("An error occurred while deleting the category");
    }
  };

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <table className="dataTable">
          <thead>
            <tr>
              <th>#</th>
              {columns.map((column, i) => (
                <th key={i}>{column.title}</th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.length ? (
              data.map((item, i) => (
                <tr key={i}>
                  <td>{item.itemNumber}</td>
                  <td>{item.title[0].text}</td>

                  <td>{moment(item.createdAt).format("DD/MM/YYYY")}</td>
                  <td>
                    <Badge type={item.active ? "success" : "danger"}>
                      {item.active ? "Active" : "Inactive"}
                    </Badge>
                  </td>

                  <td className="text-right">
                    <div className="tableMenu">
                      <button
                        onClick={() =>
                          menu === i + 1 ? setMenu(false) : setMenu(i + 1)
                        }
                      >
                        <Menu />
                      </button>
                      {menu === i + 1 && (
                        <div className="menu" ref={userMenuRef}>
                          <>
                            <button
                              onClick={() =>
                                router.push(`/categories/new?id=${item.id}`)
                              }
                            >
                              <AiOutlineEdit />
                              Edit
                            </button>
                            <button
                              onClick={() => handleStatusShow(item)}
                              className={`${!item.active ? "Inactive" : "Active"
                                }`}
                            >
                              {item.active ? (
                                <>
                                  <RemoveUser /> Inactive
                                </>
                              ) : (
                                <>
                                  <AddUser /> active
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteCategoryShow(item)}
                              className="delete"
                            >
                              <LuTrash2 /> Delete
                            </button>
                          </>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center">
                  <AiOutlineInfoCircle /> There is no Data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <Modal centered show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Body>
          <div className="modalHead">
            <h6>Delete Article</h6>
            <button onClick={handleCloseDeleteModal}>
              <Cross />
            </button>
          </div>
          <div className="modalBody">
            <h5>
              Delete "{selectedCategory?.title?.[0]?.text || ""}" Category!
            </h5>
            <p>Are you sure you want to delete this category?</p>
          </div>
          <div className="modalFooter">
            <Button onClick={handleDeleteCategory} danger>
              Delete
            </Button>
            <Button onClick={handleCloseDeleteModal} cancel>
              Cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <Modal centered show={showStatusModal} onHide={handleCloseStatusModal}>
        <Modal.Body>
          <div className="modalHead">
            <h6>{!selectedCategory?.active ? "Active" : "Inactive"} User</h6>
            <button onClick={handleCloseStatusModal}>
              <Cross />
            </button>
          </div>
          <div className="modalBody">
            <h5>
              {!selectedCategory?.active ? "Active" : "Inactive"} "
              {selectedCategory?.title?.[0]?.text || ""}"!
            </h5>
            <p>
              Are you sure to {!selectedCategory?.active ? "Active" : "Inactive"} this Category?
            </p>
          </div>
          <div className="modalFooter">
            <Button
              onClick={handleStatusFlip}
              danger={selectedCategory?.active}
              success={!selectedCategory?.active}
            >
              {selectedCategory?.active ? "Inactive" : "Active"}
            </Button>
            <Button onClick={handleCloseStatusModal} cancel>
              Cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <ToastContainer transition={Slide} />
    </div>
  );
};

export default Table;
