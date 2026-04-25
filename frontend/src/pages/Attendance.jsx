import React, { useEffect, useState } from "react";
import {
  Comparators,
  EuiBasicTable,
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiDatePicker,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPageTemplate,
  EuiText,
  EuiTitle,
} from "@elastic/eui";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import axios from "axios";
import mqtt from "mqtt";
import { toast, ToastContainer } from "react-toastify";

export default function Attendance() {
  const [date, setDate] = useState(moment());
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);


  const getStudent = async () => {
    try {
      const student = await axios.post(
        `${process.env.REACT_APP_API}/attendance/getAll`,
        {
          date,
        },
      );
      setStudents(
        student.data.data.map((s) => ({
          IDCard: s.IDCard,
          Name: s.Name,
          timeIn: s.timeIn,
          timeOut: s.timeOut,
        })),
      );
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getStudent();
  }, [date]);

  const exportFile = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/attendance/exportByDate`,
        { date },
        { responseType: "blob" }
      );
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Diem_danh_${moment(date).format("DD-MM-YYYY")}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log(err);
      alert("Xuất file thất bại!");
    }
  };

  const column = [
    { field: "IDCard", name: "ID Sinh viên" },
    { field: "Name", name: "Tên sinh viên", sortable: true },
    {
      field: "timeIn",
      name: "Thời gian vào",
      render: (timestamp) => (
        <EuiText>
          {timestamp ? moment(timestamp).format("HH:mm") : null}
        </EuiText>
      ),
    },
    {
      field: "timeOut",
      name: "Thời gian ra",
      render: (timestamp) => (
        <EuiText>
          {timestamp ? moment(timestamp).format("HH:mm") : null}
        </EuiText>
      ),
    },
  ];

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const onChange = ({ page, sort }) => {
    if (page) {
      const { index: pageIndex, size: pageSize } = page;
      setPageIndex(pageIndex);
      setPageSize(pageSize);
    }
  };

  const itemOfPage = (items, pageIndex, pageSize) => {
    let itemOfPages;
    if (!pageIndex && !pageSize) {
      itemOfPages = items;
    } else {
      itemOfPages = items.slice(
        pageIndex * pageSize,
        (pageIndex + 1) * pageSize,
      );
    }
    return itemOfPages;
  };
  const itemOfPages = itemOfPage(students, pageIndex, pageSize);

  const pagination = {
    pageIndex,
    pageSize,
    totalItemCount: students.length,
    pageSizeOptions: [0, 5, 10, 20],
  };
  return (
    <EuiPageTemplate>
      <ToastContainer />
      <EuiPageTemplate.Header
        pageTitle={
          <EuiFlexGroup alignItems="center">
            <EuiButtonIcon
              iconType="arrowLeft"
              display="fill"
              size="m"
              onClick={() => navigate("/")}
            />
            <EuiTitle>
              <h1>Thông tin điểm danh</h1>
            </EuiTitle>
          </EuiFlexGroup>
        }
      />
      <EuiPageTemplate.Section>
        <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
          <EuiText>
            <b>Điểm danh: {moment(date).format("DD/MM/YYYY")}</b>
          </EuiText>
          <EuiFlexGroup gutterSize="s" responsive={false}>
            <EuiFlexItem grow={false}>
              <EuiDatePicker selected={date} onChange={(date) => setDate(date)} />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                iconType="/assets/excel.png"
                fill
                iconSide="right"
                onClick={exportFile}
              >
                Xuất file
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexGroup>
        <EuiBasicTable
          items={itemOfPages}
          columns={column}
          pagination={pagination}
          onChange={onChange}
        />
      </EuiPageTemplate.Section>
    </EuiPageTemplate>
  );
}
