import React, { useEffect, useState, useContext } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import { Typography } from "@mui/material";

import AuthContext from "../../storage/auth-context";
import AnnouncementServiceV2 from "../../services/v2/AnnouncementService";
import EditAnnouncementModal from "./EditAnnouncementModal";
import AddAnnouncementModal from "./AddAnnouncementModal";
import "./Announcements.scss";
import TableActions from "../commonUI/TableActions";
import TableHeader from "../commonUI/TableHeader";
import greenDot from "../../assets/icons/greenDot.png";
import greyDot from "../../assets/icons/greyDot.png";

const Announcements = () => {
  const [announcementsData, setAnnouncementsData] = useState([]);
  const [addAnnouncementModal, setAddAnnouncementModal] = useState(false);
  const [editAnnouncementModal, setEditAnnouncementModal] = useState(false);
  const [announcementData, setAnnouncementData] = useState({});
  const [announcementsOrderIds, setAnnouncementsOrderIds] = useState([]);
  const [announcementId, setAnnouncementId] = useState();

  const { setIsLoading } = useContext(AuthContext);

  useEffect(() => {
    const newOrders = announcementsData.map((announcement) => announcement.id);
    setAnnouncementsOrderIds(newOrders);
  }, [announcementsData]);

  useEffect(() => {
    const orderRequest = {
      testParam: "testParam",
      announcementIds: announcementsOrderIds,
    };
    console.log(orderRequest);
    AnnouncementServiceV2.orderAnnoucements(orderRequest).then((response) => {
      response.status === 200 && console.log("response-->", response);
    });
    // eslint-disable-next-line
  }, [announcementsOrderIds]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(announcementsData);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setAnnouncementsData(items);
  };

  const getAnnouncementsData = () => {
    setIsLoading(true);
    AnnouncementServiceV2.getAnnoucements()
      .then((response) => {
        setAnnouncementsData(response.data.announcements);
      })
      .then(() => setIsLoading(false));
  };

  useEffect(() => {
    getAnnouncementsData();
    // eslint-disable-next-line
  }, []);

  const handleDeleteAnnouncement = (clickedIndex) => {
    const announcementId = announcementsData[clickedIndex]?.id;
    AnnouncementServiceV2.deleteAnnouncement(announcementId).then(
      (response) => {
        response.status === 200 && getAnnouncementsData();
      }
    );
  };

  const showAddAnnouncement = () => {
    setAddAnnouncementModal(true);
  };

  const hideAddAnnouncement = () => {
    setAddAnnouncementModal(false);
  };

  const showEditAnnouncement = (clickedIndex) => {
    setAnnouncementId(announcementsData[clickedIndex].id);
    setEditAnnouncementModal(true);
  };

  const hideEditAnnouncement = () => {
    setEditAnnouncementModal(false);
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Paper className="paper-container">
          <TableContainer>
            <TableHeader
              title="Announcements"
              showAddModal={showAddAnnouncement}
              toolTip="Add New Announcement"
            />
            <Table stickyHeader aria-label="sticky table">
              <Droppable droppableId="table">
                {(provided) => (
                  <TableBody
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {announcementsData.map((row, index) => (
                      <Draggable
                        key={row.id}
                        draggableId={row.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onDragOver={(event) => event.preventDefault()}
                            style={{
                              width: "100%",
                              display: "flex",
                              flexDirection: "row",
                              // justifyContent: "space-between",
                              gap: "2rem",
                              borderBottom: "1px solid rgba(50,50,0, 0.1)",
                              alignItems: "center",
                              backgroundColor: snapshot.isDragging
                                ? "rgba(50,50,0, 0.1)"
                                : "white",
                              ...provided.draggableProps.style,
                            }}
                          >
                            <TableCell className="table-cell-status">
                              {/* <FiberManualRecordIcon
                                fontSize="0.5rem"
                                color="error"
                              /> */}
                              {row.status === "LIVE" && (
                                <img src={greenDot} alt="live icon" />
                              )}
                              {row.status === "DRAFT" && (
                                <img src={greyDot} alt="draft icon" />
                              )}
                              <p>{row.status}</p>
                            </TableCell>
                            <TableCell className="table-cell">
                              {row.text}
                            </TableCell>
                            {/* <TableCell className="table-cell">
                              {row.textFrench}
                            </TableCell>
                            <TableCell className="table-cell">
                              {row.textDutch}
                            </TableCell> */}

                            <TableCell
                              className="actions"
                              style={{
                                // minWidth: "7rem",
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: "center",
                                borderBottom: "none",
                                padding: "0",
                              }}
                            >
                              <TableActions
                                handleDelete={() =>
                                  handleDeleteAnnouncement(index)
                                }
                                showEdit={() => showEditAnnouncement(index)}
                              />
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    <TableRow className="table-footer">
                      {/* <Typography
                        color="primary"
                        component="p"
                        className="footer-typo"
                      >
                        See more announcement
                      </Typography>
                      <ExpandMoreIcon color="primary" /> */}
                    </TableRow>
                  </TableBody>
                )}
              </Droppable>
            </Table>
          </TableContainer>
        </Paper>
      </DragDropContext>
      {addAnnouncementModal && (
        <AddAnnouncementModal
          onHide={hideAddAnnouncement}
          openModal={addAnnouncementModal}
          setAddAnnouncementModal={setAddAnnouncementModal}
          getAnnouncementsData={getAnnouncementsData}
          orderLength={announcementsData.length}
        />
      )}

      {editAnnouncementModal && (
        <EditAnnouncementModal
          onHide={hideEditAnnouncement}
          openModal={editAnnouncementModal}
          setEditAnnouncementModal={setEditAnnouncementModal}
          getAnnouncementsData={getAnnouncementsData}
          announcementId={announcementId}
        />
      )}
    </>
  );
};

export default Announcements;
