$.fn.modal.Constructor.prototype._enforceFocus = function() {
    var $modalElement = this.$element;
    $(document).on('focusin.modal',function(e) {
        if ($modalElement && $modalElement[0] !== e.target
            && !$modalElement.has(e.target).length
            && $(e.target).parentsUntil('*[role="dialog"]').length === 0) {
            $modalElement.focus();
        }
    });
};