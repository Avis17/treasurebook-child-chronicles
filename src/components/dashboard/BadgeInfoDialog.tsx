
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { HelpCircle } from "lucide-react"

const badgeThresholds = [
  { activity: "Quizzes", bronze: 5, silver: 20, gold: 50 },
  { activity: "Journals", bronze: 3, silver: 10, gold: 30 },
  { activity: "Goals Completed", bronze: 5, silver: 15, gold: 30 },
  { activity: "Sports Participations", bronze: 3, silver: 10, gold: 20 },
  { activity: "Extracurricular", bronze: 3, silver: 10, gold: 20 },
]

export function BadgeInfoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="p-0 h-auto">
          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>How Badges are Earned</DialogTitle>
          <DialogDescription>
            Badges are awarded based on your child's achievements across different activities
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Bronze</TableHead>
                <TableHead>Silver</TableHead>
                <TableHead>Gold</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {badgeThresholds.map((row) => (
                <TableRow key={row.activity}>
                  <TableCell>{row.activity}</TableCell>
                  <TableCell>{row.bronze}</TableCell>
                  <TableCell>{row.silver}</TableCell>
                  <TableCell>{row.gold}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-4 text-sm text-muted-foreground">
            For example: Complete 5 quizzes to earn Bronze, 20 for Silver, and 50 for Gold badge in the Quiz category.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
