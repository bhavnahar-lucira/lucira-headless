import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function NomineeForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nominee Details</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-3 gap-4">
        <Input placeholder="Full Name" />
        <Input placeholder="Age" />
        <Input placeholder="Relation" />
      </CardContent>
    </Card>
  );
}
