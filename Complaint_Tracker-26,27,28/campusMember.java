package mini;

public abstract class campusMember {

    private String name;
    private String memberId;

    public campusMember(String name, String memberId) {
        this.name = name;
        this.memberId = memberId;
    }

    public String getName() {
        return name;
    }

    public String getMemberId() {
        return memberId;
    }

    public abstract String getRole();
}
