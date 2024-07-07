/* eslint-disable react/prop-types */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  // DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddUserForm from "./AddUserForm";

export default function AddUserDialog({ loadUserMapData }) {
  const [open, setOpen] = useState(false);
  const handleSubmit = (userValue) => {
    const loadRes = loadUserMapData(userValue);
    if (loadRes) {
      setOpen(false);
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
