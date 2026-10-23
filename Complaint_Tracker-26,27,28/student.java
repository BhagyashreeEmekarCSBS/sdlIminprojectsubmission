
package mini;

public class student extends campusMember {

    public student(String name, String memberId) {
        super(name, memberId);
    }

    @Override
    public String getRole() {
        return "Student";
    }
}
