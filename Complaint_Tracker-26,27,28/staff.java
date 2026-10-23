

package mini;

public class staff extends campusMember {

    public staff(String name, String memberId) {
        super(name, memberId);
    }

    @Override
    public String getRole() {
        return "Staff";
    }
}
