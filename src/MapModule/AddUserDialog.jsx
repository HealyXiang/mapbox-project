/* eslint-disable react/prop-types */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

import AddUserForm from "./AddUserForm";
import useAddUser from "@/hooks/useAddUser";

export default function AddUserDialog() {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const { addOneMapUser } = useAddUser();

  const handleSubmit = (userValue) => {
    try {
      const loadRes = addOneMapUser(userValue);
      toast({ description: "增加用户数据成功" });
      setOpen(false);
      console.log("loadRes loadRes:", loadRes);
    } catch (error) {
      console.log("input add user error:", error);
    }
  };

  const onOpenChange = (open) => {
    setOpen(open);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>增加用户数据</Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>增加用户</DialogTitle>
          <DialogDescription>添加用户数据</DialogDescription>
        </DialogHeader>
        <AddUserForm handleSubmit={handleSubmit} />
        {/* <DialogClose asChild>
          <Button type="button" variant="secondary">
            Close
          </Button>
        </DialogClose> */}
        {/* <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
