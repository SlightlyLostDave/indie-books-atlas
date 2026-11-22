import { PlannedSection } from "@/components/admin/PlannedSection";

export default function AdminUsersPage() {
  return (
    <PlannedSection
      title="Users"
      lede="Who can sign in to the compilation office."
      willDo={
        <p>
          List the people who can sign in, invite someone new, and remove access. If editors arrive with different
          jobs, this is where their roles would be set.
        </p>
      }
      waitingOn={
        <p>
          A decision about roles. Today everyone who can sign in is a full admin, and sign-in is by invitation only,
          so there&apos;s nothing to manage here until the office has more than one kind of user.
        </p>
      }
      meanwhile={<p>Invitations and removals are made in the Clerk dashboard.</p>}
      placeholder="The list of people with access will sit here."
    />
  );
}
