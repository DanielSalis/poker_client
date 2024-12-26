import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const DialogLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Dialog open={true}>
    <DialogContent className="w-[360px] min-h-[640px] flex flex-col justify-start">
      <DialogHeader>
        <DialogTitle>Welcome to li<em>a</em>poker</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
);

export default DialogLayout