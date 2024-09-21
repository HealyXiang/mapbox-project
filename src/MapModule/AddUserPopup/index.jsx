/* eslint-disable react/prop-types */
import ReactDOM from "react-dom/client";
import AddUserForm from "@/MapModule/AddUserForm";
import { useToast } from "@/components/ui/use-toast";
import useAddUser from "@/hooks/useAddUser";

const formItems = [
  {
    formItemKey: "username",
    formItemLabel: "姓名",
    formItemPlaceholder: "请输入用户姓名",
  },
  {
    formItemKey: "address",
    formItemLabel: "地址",
    formItemPlaceholder: "请输入地址信息",
  },
  {
    formItemKey: "latitude",
    formItemLabel: "纬度",
    disabled: true,
  },
  {
    formItemKey: "longitude",
    formItemLabel: "经度",
    disabled: true,
  },
];
function PopupContent({ latitude, longitude }) {
  const { toast } = useToast();
  const { addOneMapUser } = useAddUser();

  const handleSubmit = (userValue) => {
    try {
      const loadRes = addOneMapUser(userValue);
      toast({ description: "增加用户数据成功" });
      console.log("loadRes loadRes:", loadRes);
    } catch (error) {
      console.log("input add user error:", error);
    }
  };
  console.log("latitude:", latitude, "longitude:", longitude);
  return (
    <AddUserForm
      formItems={formItems}
      defaultValues={{ latitude, longitude }}
      handleSubmit={handleSubmit}
    />
  );
}

export default function CreateAddUserPopup({ latitude, longitude }) {
  const popUpElement = document.createElement("div");

  ReactDOM.createRoot(popUpElement).render(
    <PopupContent latitude={latitude} longitude={longitude} />
  );
  return popUpElement;
}
